import React, { useEffect, useState } from "react";
import "./NoDataWarning.css";
import { getReply } from "./websocket";
import c from "./config.json";

function NoDataWarning() {
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    getReply(c.actions.sendGameData).then(() => setShowWarning(false));
  }, []);

  let ipAddress = window.location.hostname;
  if (ipAddress === "localhost") {
    ipAddress = "127.0.0.1";
  }

  return showWarning ? (
    <div className="NoDataDiv">
      <div>
        <div>
          <p>No data recieved.</p>
          <p>Use these settings in Forza:</p>
          <p>Data Out: On</p>
          <p>Data Out IP Address: {ipAddress}</p>
          <p>Data Out UDP Port: {c.udpPort}</p>
        </div>
        <button type="button" onClick={() => setShowWarning(false)}>
          ×
        </button>
      </div>
    </div>
  ) : (
    <div />
  );
}

export default NoDataWarning;
