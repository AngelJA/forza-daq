import React, { useEffect, useState } from "react";
import "./App.css";
import Map from "./Map";
import LogControls from "./LogControls";
import NoDataWarning from "./NoDataWarning";
import LineChart, { ChartConfig, getChartConfigs } from "./LineChart";

function App() {
  const [configs, setConfigs] = useState<ChartConfig[]>([]);

  useEffect(() => {
    getChartConfigs().then(setConfigs);
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
