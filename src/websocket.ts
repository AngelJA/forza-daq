import c from "./config.json";

const webSocket = new WebSocket(`ws://${window.location.hostname}:${c.wsPort}`);

export default webSocket;

window.addEventListener("beforeunload", () => {
  webSocket.close();
});
