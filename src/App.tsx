import { Map as LeafletMap } from "leaflet";
import React, { useEffect, useState } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./App.css";
import Map from "./Map";
import LogControls from "./LogControls";
import NoDataWarning from "./NoDataWarning";
import LineChart, { ChartConfig } from "./LineChart";
import { request } from "./websocket";
import c from "./config.json";

const ReactGridLayout = WidthProvider(RGL);
const layoutsKey = "layouts";

function App() {
  const [configs, setConfigs] = useState<ChartConfig[]>([]);
  const [map, setMap] = useState<LeafletMap>();
  const [layout, setLayout] = useState(
    JSON.parse(global.localStorage?.getItem(layoutsKey) ?? "null") ?? []
  );
  const [doneLoading, setDoneLoading] = useState(false);

  useEffect(() => {
    request<{ configs: ChartConfig[] }>(c.actions.sendChartConfigs).then(
      (reply) => {
        setConfigs(reply.configs);
        setDoneLoading(true);
        setLayout(layout); // force re-render now that charts are loaded
      }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="App">
      <NoDataWarning />
      <LogControls />
      <ReactGridLayout
        className="layout"
        cols={12}
        layout={layout}
        onLayoutChange={(newLayout) => {
          setLayout(newLayout);
          if (doneLoading) {
            global.localStorage?.setItem(layoutsKey, JSON.stringify(newLayout));
          }
        }}
        onResizeStop={() => map?.invalidateSize()}
        rowHeight={20}
        margin={[0, 0]}
        draggableHandle=".DragHandle"
      >
        <div key="a" data-grid={{ x: 0, y: 0, w: 12, h: 20 }}>
          <Map setMap={setMap} />
          <div className="DragHandle" />
        </div>
        {configs.map((config) => (
          <div
            key={JSON.stringify(config.fields)}
            data-grid={{ x: 0, y: 0, w: 12, h: 10 }}
          >
            <LineChart config={config} />
            <div className="DragHandle" />
          </div>
        ))}
      </ReactGridLayout>
    </div>
  );
}

export default App;
