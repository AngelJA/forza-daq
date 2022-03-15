import React, { useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './App.css';
import Map from './Map';
import LogControls from './LogControls';
import NoDataWarning from './NoDataWarning';
import LineChart, { ChartConfig, getChartConfigs } from './LineChart';

const ResponsiveGridLayout = WidthProvider(Responsive);

function App() {
  const [configs, setConfigs] = useState<ChartConfig[]>([]);

  useEffect(() => {
    getChartConfigs().then(setConfigs);
  }, []);

  return (
    <div className="App">
      <NoDataWarning />
      <Map />
      <LogControls />
      <ResponsiveGridLayout
        className="layout"
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={20}
        margin={[0, 0]}
        draggableHandle=".DragHandle"
      >
        <div key="a" data-grid={{ x: 0, y: 0, w: 12, h: 20 }}>
          <Map />
          <div className="DragHandle" />
        </div>
        {configs.map((config) => (
          <div
            key={JSON.stringify(config)}
            data-grid={{ x: 0, y: 0, w: 12, h: 10 }}
          >
            <LineChart config={config} />
            <div className="DragHandle" />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}

export default App;
