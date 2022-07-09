import { readFileSync, writeFileSync } from "fs";
import { ChartData, ChartConfiguration } from "chart.js";

const filePath = "config.json";

export type ChartConfig = {
  fps: number;
  maxDataPoints: number;
  fields: string[];
  data: ChartData<"line">;
  chartConfig: ChartConfiguration<"line">;
};

export type UserConfig = { chart: { configs: ChartConfig[] } };

export function getUserConfig() {
  const data: UserConfig = JSON.parse(
    readFileSync(filePath, { encoding: "utf-8" })
  );
  return data;
}

export function writeUserConfig(data: UserConfig) {
  data.chart.configs.forEach((config) => {
    config.data.datasets.forEach((dataset) => {
      dataset.data = []; // eslint-disable-line no-param-reassign
    });
  });
  writeFileSync(filePath, JSON.stringify(data, null, 2), {
    encoding: "utf-8",
  });
}
