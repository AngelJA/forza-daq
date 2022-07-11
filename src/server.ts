/* eslint-disable no-console */
import dgram from "dgram";
import { MessageEvent, WebSocket } from "ws";
import express from "express";
import { join } from "path";
import { open, readdir } from "fs/promises";
import c from "./config.json";
import { getUserConfig, writeUserConfig } from "./userConfig";
import { fields, messageLength, parseForzaData } from "./forzaData";

class Server {
  lastMsg: Buffer | null = null;

  ws!: WebSocket;

  scrubPosition: number | null = null;

  constructor() {
    const udpSocket = dgram.createSocket("udp4");
    udpSocket.bind(c.udpPort);

    udpSocket.on("error", (err) => {
      console.log(`UDP socket error:\n${err.stack}`);
      udpSocket.close();
    });

    udpSocket.on("message", this.onUdpMsg.bind(this));
  }

  newWsConnection(ws: WebSocket) {
    this.ws = ws;
    this.ws.addEventListener("message", this.onWsMsg.bind(this));
  }

  async request<T, U extends { action: number } = any>(command: U): Promise<T> {
    this.ws.send(JSON.stringify(command));
    return this.getReply<T>(command.action);
  }

  async getReply<T>(action: number): Promise<T> {
    return new Promise((resolve) => {
      const listener = (event: MessageEvent) => {
        const msg = JSON.parse(event.data.toString());
        if (msg.action === action) {
          resolve(msg);
          this.ws.removeEventListener("message", listener);
        }
      };
      this.ws.addEventListener("message", listener);
    });
  }

  onWsMsg(msg: MessageEvent) {
    const command = JSON.parse(msg.data.toString());
    if (command.action === c.actions.startRecording) {
      this.recordToFile();
    } else if (command.action === c.actions.startPlayback) {
      this.playbackFromFile();
    } else if (command.action === c.actions.sendChartConfigs) {
      if (command.configs) {
        writeUserConfig(command.configs);
      } else {
        this.ws.send(
          JSON.stringify({
            action: c.actions.sendChartConfigs,
            configs: getUserConfig(),
          })
        );
      }
    } else if (command.action === c.actions.sendScrubPosition) {
      this.scrubPosition = command.pos;
    }
  }

  onUdpMsg(msg: Buffer) {
    this.lastMsg = msg;
    const values = parseForzaData(msg);
    const gameData = Object.fromEntries(
      Object.keys(fields).map((f: string, i: number) => [f, values[i]])
    );
    this.ws?.send(
      JSON.stringify({
        action: c.actions.sendGameData,
        gameData,
      })
    );
  }

  async getLogFileName() {
    const fileNames = await readdir("logs");
    const reply = await this.request<{ logFileName: string }>({
      action: c.actions.sendLogFileName,
      fileNames,
    });
    return `logs/${reply.logFileName}`;
  }

  async playbackFromFile() {
    const filename = await this.getLogFileName();
    const fh = await open(filename, "r");
    const { size: fileSize } = await fh.stat();
    const client = dgram.createSocket("udp4");
    const data = Buffer.alloc(messageLength);
    let offset = 0;

    const intervalID = setInterval(async () => {
      const { bytesRead } = await fh.read(data, 0, messageLength, offset);
      if (bytesRead === 0) {
        offset = 0;
      } else {
        if (this.scrubPosition) {
          offset =
            Math.round(
              ((this.scrubPosition / 100) * fileSize) / messageLength
            ) * messageLength;
          this.scrubPosition = null;
        } else {
          offset += messageLength;
        }
        this.ws.send(
          JSON.stringify({
            action: c.actions.sendScrubPosition,
            pos: (offset / fileSize) * 100,
          })
        );
        client.send(data, c.udpPort, "localhost");
      }
    }, 1000 / c.logRate);
    await this.getReply(c.actions.endPlayback);
    clearInterval(intervalID);

    fh?.close();
  }

  async recordToFile() {
    const date = new Date();
    const dateString = date.toLocaleDateString().replaceAll("/", "-");
    const timeString = date
      .toLocaleTimeString([], { hour12: false })
      .replaceAll(":", "-");
    const filename = `logs/${dateString}-${timeString}.bin`;
    const fh = await open(filename, "w");
    console.log(`Writing to log file: ${filename}`);

    const intervalID = setInterval(() => {
      if (this.lastMsg) {
        fh.appendFile(this.lastMsg, "binary");
        this.lastMsg = null;
      }
    }, 1000 / c.logRate);
    await this.getReply(c.actions.endRecording);
    clearInterval(intervalID);
    fh?.close();
  }
}

if (require.main === module) {
  const server = new Server();
  const webSocketServer = new WebSocket.Server({ port: c.wsPort });
  webSocketServer.on("connection", server.newWsConnection.bind(server));

  if (!process.argv.includes("dev")) {
    const app = express();
    app.use(express.static(join(__dirname, "../build")));
    app.get("*", (req, res) => {
      res.sendFile(join(__dirname, "../build/index.html"));
    });
    app.listen(c.webPort);
    console.log(`Go to: http://localhost:${c.webPort}`);
  }
}
