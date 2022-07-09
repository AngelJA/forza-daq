import React, { useEffect, useRef, useState } from "react";
import {
  CategoryScale,
  Chart,
  ChartDataset,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ScatterDataPoint,
} from "chart.js";
import ws from "./websocket";
import "./LineChart.css";
import c from "./config.json";
import { ChartConfig } from "./userConfig";

Chart.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement
);

function updateChartCallback(config: ChartConfig) {
  return (event: MessageEvent) => {
    const msg = JSON.parse(event.data);
    if (msg.type === c.actions.sendGameData) {
      config.data.datasets.forEach((dataset, i) => {
        const key = config.fields[i];
        const { data } = dataset as ChartDataset<"line", ScatterDataPoint[]>;
        data.push({ x: 0, y: msg.gameData[key] });
        while (data.length > config.maxDataPoints) {
          data.shift();
        }
        data.forEach((point, j) => {
          point.x = config.maxDataPoints - data.length + j; // eslint-disable-line no-param-reassign
        });
      });
    }
  };
}

function LineChart({
  config,
  editConfig,
}: React.PropsWithChildren<{
  config: ChartConfig;
  editConfig: (configToEdit: ChartConfig) => void;
}>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showLegend, setShowLegend] = useState(true);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        const abortController = new AbortController();
        const chart = new Chart(context, {
          ...config.chartConfig,
          data: { ...config.data, labels: new Array(config.maxDataPoints) },
        });
        chartRef.current = chart;
        const timerID = setInterval(() => chart?.update(), 1000 / config.fps);
        ws.addEventListener("message", updateChartCallback(config), {
          signal: abortController.signal,
        });
        return () => {
          clearInterval(timerID);
          abortController.abort();
          chart.destroy();
        };
      }
    }
    return () => {};
  }, [config]);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart?.options.plugins?.legend) {
      chart.options.plugins.legend.display = showLegend;
    }
    chart?.update();
  }, [showLegend]);

  return (
    <div className="LineChart">
      <button
        type="button"
        className="ToggleLegendButton"
        onClick={() => setShowLegend(!showLegend)}
      >
        {showLegend ? "-" : "+"}
      </button>
      <button
        type="button"
        className="EditConfigButton"
        onClick={() => {
          editConfig(config);
        }}
      >
        edit
      </button>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default LineChart;
