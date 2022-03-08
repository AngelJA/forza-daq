/* eslint-disable no-console */
import dgram from "dgram";
import WebSocket from "ws";
import c from "./config.json";
import { fieldNames, parseForzaData } from "./forzaData";

if (require.main === module) {
  let webSocket: WebSocket;

  const webSocketServer = new WebSocket.Server({ port: c.wsPort });
  webSocketServer.on("connection", (ws) => {
    console.log("Connection established with web app.");
    webSocket = ws;
  });

  const udpSocket = dgram.createSocket("udp4");
  udpSocket.on("error", (err) => {
    console.log(`UDP socket error:\n${err.stack}`);
    udpSocket.close();
  });

  udpSocket.on("message", (msg) => {
    const values = parseForzaData(msg);
    const object = Object.fromEntries(
      fieldNames.map((f: string, i: number) => [f, values[i]])
    );
    if (webSocket) {
      webSocket.send(JSON.stringify(object));
    }
  });

  udpSocket.on("listening", () => {
    const address = udpSocket.address();
    console.log(
      `Listening for Forza data at: ${address.address}:${address.port}`
    );
  });

  udpSocket.bind(c.udpPort);
}
