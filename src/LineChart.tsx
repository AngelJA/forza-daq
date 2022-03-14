import React, { useEffect, useRef, useState } from 'react';
import {
  CategoryScale,
  Chart,
  ChartData,
  ChartConfiguration,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from 'chart.js';
import ws, { getReply, sendCommand } from './websocket';
import { fields } from './forzaData';
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
      const labels = chart.config.data.labels || [];
      chart.config.data.labels?.push(msg.gameData.u32TimestampMS);
      if (labels.length > config.maxDataPoints) {
        labels.shift();
      }
      config.data.datasets.forEach((dataset, i) => {
        const key = config.fields[i];
        const { data } = dataset;
        const val = msg.gameData[key as keyof typeof fields];
        if (key?.startsWith('u8')) {
          data.push(val / 255);
        } else if (key?.startsWith('s8')) {
          data.push((val + 128) / 255);
        } else {
          data.push(val);
        }
        if (data?.length > config.maxDataPoints) {
          data.shift();
        }
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
    data: config.data,
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
