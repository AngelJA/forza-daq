/* eslint-disable no-console */
import dgram from "dgram";
import WebSocket from "ws";
import { open, readdir } from "fs/promises";
import c from "./config.json";
import userConfig from "./userConfig";
import { fieldNames, messageLength, parseForzaData } from "./forzaData";

class Server {
  lastMsg: Buffer | null = null;

  ws!: WebSocket.WebSocket;

  constructor() {
    const udpSocket = dgram.createSocket("udp4");
    udpSocket.bind(c.udpPort);

    udpSocket.on("error", (err) => {
      console.log(`UDP socket error:\n${err.stack}`);
      udpSocket.close();
    });

    udpSocket.on("listening", () => {
      const address = udpSocket.address();
      console.log(
        `Listening for Forza data at: ${address.address}:${address.port}`
      );
    });

    udpSocket.on("message", this.onUdpMsg.bind(this));
  }

  newWsConnection(ws: WebSocket.WebSocket) {
    this.ws = ws;
    this.ws.addEventListener("message", this.onWsMsg.bind(this));
  }

  async getReply(condition: (msg: any) => boolean) {
    return new Promise((resolve) => {
      const listener = (event: WebSocket.MessageEvent) => {
        const msg = JSON.parse(event.data.toString());
        if (condition(msg)) {
          resolve(msg);
          this.ws.removeEventListener("message", listener);
        }
      };
      this.ws.addEventListener("message", listener);
    });
  }

  onWsMsg(msg: WebSocket.MessageEvent) {
    const command = JSON.parse(msg.data.toString());
    if (command.action === c.actions.startRecording) {
      this.recordToFile();
    } else if (command.action === c.actions.startPlayback) {
      this.playbackFromFile();
    }
  }

  onUdpMsg(msg: Buffer) {
    this.lastMsg = msg;
    const values = parseForzaData(msg);
    const gameData = Object.fromEntries(
      fieldNames.map((f: string, i: number) => [f, values[i]])
    );
    if (this.ws) {
      this.ws.send(
        JSON.stringify({
          type: c.actions.sendGameData,
          gameData,
        })
      );
    }
  }

  async getLogFileName() {
    const fileNames = await readdir("logs");
    if (this.ws) {
      this.ws.send(
        JSON.stringify({
          type: c.actions.requestLogFileName,
          fileNames,
        })
      );
    }
    const reply = (await this.getReply(
      (msg) => msg.action === c.actions.sendLogFileName
    )) as { logFileName: string };
    return `logs/${reply.logFileName}`;
  }

  async playbackFromFile() {
    const filename = await this.getLogFileName();
    const fh = await open(filename, "r");
    const client = dgram.createSocket("udp4");
    const data = Buffer.alloc(messageLength);
    let offset = 0;

    const intervalID = setInterval(async () => {
      const { bytesRead } = await fh.read(data, 0, messageLength, offset);
      if (bytesRead === 0) {
        offset = 0;
      } else {
        offset += messageLength;
        client.send(data, c.udpPort, "localhost");
      }
    }, 1000 / userConfig.logRate);
    await this.getReply((msg) => msg.action === c.actions.endPlayback);
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
    }, 1000 / userConfig.logRate);
    await this.getReply((msg) => msg.action === c.actions.endRecording);
    clearInterval(intervalID);
    fh?.close();
  }
}

if (require.main === module) {
  const server = new Server();
  const webSocketServer = new WebSocket.Server({ port: c.wsPort });
  webSocketServer.on("connection", server.newWsConnection.bind(server));
}
