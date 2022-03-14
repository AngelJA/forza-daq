import React, { useEffect, useRef, useState } from 'react';
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
} from 'chart.js';
import ws, { getReply, sendCommand } from './websocket';
import './LineChart.css';
import c from './config.json';

Chart.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
);

export type ChartConfig = {
  fps: number;
  maxDataPoints: number;
  fields: string[];
  data: ChartData;
  chartConfig: ChartConfiguration;
};

export async function getChartConfigs(): Promise<ChartConfig[]> {
  sendCommand(c.actions.requestChartConfigs);
  const reply = (await getReply(
    (msg) => msg.type === c.actions.sendChartConfigs,
  )) as { configs: ChartConfig[] };
  return reply.configs;
}

function updateChartCallback(chart: Chart, config: ChartConfig) {
  return (event: MessageEvent) => {
    const msg = JSON.parse(event.data);
    if (msg.type === c.actions.sendGameData) {
      config.data.datasets.forEach((dataset, i) => {
        const key = config.fields[i];
        let y = msg.gameData[key];
        if (key?.startsWith('u8')) {
          y /= 255;
        } else if (key?.startsWith('s8')) {
          y = (y + 128) / 255;
        }
        const { data } = dataset as ChartDataset<'line', ScatterDataPoint[]>;
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

function createChart(
  context: CanvasRenderingContext2D,
  config: ChartConfig,
): Chart {
  const chart = new Chart(context, {
    ...config.chartConfig,
    data: { ...config.data, labels: new Array(config.maxDataPoints) },
  });
  setInterval(() => chart?.update(), 1000 / config.fps);
  ws.addEventListener('message', updateChartCallback(chart, config));
  return chart;
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
      const context = canvas.getContext('2d');
      if (context) {
        const chart = createChart(context, config);
        chartRef.current = chart;
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        {showLegend ? '-' : '+'}
      </button>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default LineChart;
