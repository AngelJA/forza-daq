import c from "./config.json";

const webSocket = new WebSocket(`ws://${window.location.hostname}:${c.wsPort}`);

export default webSocket;

export async function sendCommand(command: number, data?: object) {
  if (webSocket.readyState !== 1) {
    await new Promise<void>((resolve) => {
      const controller = new AbortController();
      webSocket.addEventListener(
        "open",
        () => {
          controller.abort();
          resolve();
        },
        { signal: controller.signal }
      );
    });
  }

  webSocket.send(JSON.stringify({ action: command, ...data }));
}

window.addEventListener("beforeunload", () => {
  webSocket.close();
});
