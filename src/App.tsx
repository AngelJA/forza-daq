import { Map as LeafletMap } from "leaflet";
import React, { useEffect, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./App.css";
import Map from "./Map";
import { getReply, sendCommand } from "./websocket";
import { ChartConfig, UserConfig } from "./userConfig";
import c from "./config.json";
import LogControls from "./LogControls";
import NoDataWarning from "./NoDataWarning";
import LineChart from "./LineChart";
import CarAndLapInfo from "./CarAndLapInfo";
import ConfigEditor from "./ConfigEditor";

const ResponsiveGridLayout = WidthProvider(Responsive);

function App() {
  const [userConfig, setUserConfig] = useState<UserConfig>();
  const [map, setMap] = useState<LeafletMap>();
  const [configToEdit, setConfigToEdit] = useState<ChartConfig>();

  useEffect(() => {
    sendCommand(c.actions.requestUserConfig);
    getReply<UserConfig>((msg) => msg.type === c.actions.sendUserConfig).then(
      setUserConfig
    );
  }, []);

  return (
    <div className="App">
      <NoDataWarning />
      <LogControls />
      {configToEdit && (
        <ConfigEditor
          initialConfig={configToEdit}
          doneEditing={() => {
            setConfigToEdit(undefined);
            sendCommand(c.actions.sendUserConfig, { userConfig });
          }}
        />
      )}
      <CarAndLapInfo />
      <ResponsiveGridLayout
        className="layout"
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        onResizeStop={() => map?.invalidateSize()}
        rowHeight={20}
        margin={[0, 0]}
        draggableHandle=".DragHandle"
      >
        <div key="a" data-grid={{ x: 0, y: 0, w: 12, h: 20 }}>
          <Map setMap={setMap} />
          <div className="DragHandle" />
        </div>
        {userConfig?.chart?.configs.map((config) => (
          <div
            key={JSON.stringify(config)}
            data-grid={{ x: 0, y: 0, w: 12, h: 10 }}
          >
            <LineChart
              config={config}
              editConfig={(cc: ChartConfig) => setConfigToEdit(cc)}
            />
            <div className="DragHandle" />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}

export default App;
