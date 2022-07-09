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

export function getReply<T>(condition: (msg: any) => boolean): Promise<T> {
  return new Promise((resolve) => {
    const controller = new AbortController();
    webSocket.addEventListener(
      "message",
      (event) => {
        const msg = JSON.parse(event.data);
        if (condition(msg)) {
          controller.abort();
          resolve(msg.data);
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
