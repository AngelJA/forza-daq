import c from './config.json';

const webSocket = new WebSocket(`ws://${window.location.hostname}:${c.wsPort}`);

export default webSocket;

export async function sendCommand(command: number, data?: object) {
  while (webSocket.readyState !== 1) {
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
  }

  webSocket.send(JSON.stringify({ action: command, ...data }));
}

export function getReply(condition: (msg: any) => boolean) {
  return new Promise((resolve) => {
    const controller = new AbortController();
    webSocket.addEventListener(
      'message',
      (event) => {
        const msg = JSON.parse(event.data);
        if (condition(msg)) {
          controller.abort();
          resolve(msg);
        }
      },
      { signal: controller.signal },
    );
  });
}

window.addEventListener('beforeunload', () => {
  sendCommand(c.actions.endRecording);
  sendCommand(c.actions.endPlayback);
  webSocket.close();
});
