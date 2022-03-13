import c from "./config.json";

const webSocket = new WebSocket(`ws://${window.location.hostname}:${c.wsPort}`);

export default webSocket;

export async function sendCommand(action: number, data?: object) {
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

  webSocket.send(JSON.stringify({ action, ...data }));
}

export function getReply<T>(action: number): Promise<T> {
  return new Promise<T>((resolve) => {
    const controller = new AbortController();
    webSocket.addEventListener(
      "message",
      (event) => {
        const msg = JSON.parse(event.data);
        if (msg.action === action) {
          controller.abort();
          resolve(msg);
        }
      },
      { signal: controller.signal }
    );
  });
}

window.addEventListener("beforeunload", () => {
  sendCommand(c.actions.endRecording);
  sendCommand(c.actions.endPlayback);
  webSocket.close();
});
