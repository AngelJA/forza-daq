import c from './config.json';

const webSocket = new WebSocket(`ws://${window.location.hostname}:${c.wsPort}`);

export default webSocket;

export function sendCommand(command: number, data?: object) {
  webSocket.send(JSON.stringify({ action: command, ...data }));
}

window.addEventListener('beforeunload', () => {
  sendCommand(c.actions.endRecording);
  sendCommand(c.actions.endPlayback);
  webSocket.close();
});
