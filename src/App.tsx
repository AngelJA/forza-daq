import React, { useEffect, useState } from "react";
import "./App.css";
import Map from "./Map";
import LogControls from "./LogControls";
import NoDataWarning from "./NoDataWarning";
import LineChart, { ChartConfig } from "./LineChart";
import { request } from "./websocket";
import c from "./config.json";

function App() {
  const [configs, setConfigs] = useState<ChartConfig[]>([]);

  useEffect(() => {
    request<{ configs: ChartConfig[] }>(c.actions.sendChartConfigs).then(
      (reply) => setConfigs(reply.configs)
    );
  }, []);

  return (
    <div className="App">
      <LogControls />
      <NoDataWarning />
      <Map />
      {configs.map((config) => (
        <LineChart key={JSON.stringify(config)} config={config} />
      ))}
    </div>
  );
}

export default App;
