import React, { useEffect, useState } from 'react';
import ws, { sendCommand } from './websocket';
import './LogControls.css';
import c from './config.json';

function LogControls() {
  const [state, setState] = useState({
    playingBack: false,
    recording: false,
    showControls: false,
    fileList: [],
  });
  const updateState = (newState: any) =>
    setState((prevState) => ({
      ...prevState,
      ...newState,
    }));

  useEffect(() => {
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === c.actions.requestLogFileName) {
        updateState({ fileList: msg.fileNames });
      }
    });
  }, []);

  const startStopRecording = () => {
    if (!state.recording) {
      sendCommand(c.actions.startRecording);
    } else {
      sendCommand(c.actions.endRecording);
    }
    updateState({ recording: !state.recording });
  };

  const startStopPlayback = () => {
    if (!state.playingBack) {
      sendCommand(c.actions.startPlayback);
    } else {
      sendCommand(c.actions.endPlayback);
    }
    updateState({ playingBack: !state.playingBack });
  };

  return (
    <div className="Controls">
      <div className="Buttons">
        <button
          type="button"
          onClick={() => updateState({ showControls: !state.showControls })}
        >
          {state.showControls ? '<' : '>'}
        </button>
        {state.showControls && (
          <>
            <button
              type="button"
              disabled={state.playingBack}
              onClick={startStopRecording}
            >
              {state.recording ? '⏹' : '🔴'}
            </button>
            <button
              type="button"
              disabled={state.recording}
              onClick={startStopPlayback}
            >
              {state.playingBack ? '⏹' : '▶'}
            </button>
          </>
        )}
      </div>
      {state.fileList.length > 0 && (
        <div className="FileList">
          {state.fileList.map((fileName) => (
            <button
              type="button"
              key={fileName}
              onClick={(event) => {
                updateState({ fileList: [] });
                sendCommand(c.actions.sendLogFileName, {
                  logFileName: event.currentTarget.innerHTML,
                });
              }}
            >
              {fileName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LogControls;
