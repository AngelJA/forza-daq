import React, { useEffect, useRef, useState } from "react";
import {
  CategoryScale,
  Chart,
  ChartData,
  ChartDataset,
  ChartConfiguration,
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

Chart.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement
);

export type ChartConfig = {
  fps: number;
  maxDataPoints: number;
  fields: string[];
  data: ChartData;
  chartConfig: ChartConfiguration;
};

function updateChartCallback(config: ChartConfig) {
  return (event: MessageEvent) => {
    const msg = JSON.parse(event.data);
    if (msg.action === c.actions.sendGameData) {
      config.data.datasets.forEach((dataset, i) => {
        const key = config.fields[i];
        let y = msg.gameData[key];
        if (key?.startsWith("u8")) {
          y /= 255;
        } else if (key?.startsWith("s8")) {
          y = -(y + 128) / 255 + 1;
        }
        const { data } = dataset as ChartDataset<"line", ScatterDataPoint[]>;
        data.push({ x: 0, y });
        if (data.length > config.maxDataPoints) {
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
}: React.PropsWithChildren<{ config: ChartConfig }>) {
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
      <canvas ref={canvasRef} />
    </div>
  );
}

export default LineChart;
