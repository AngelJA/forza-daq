import { readFileSync, writeFileSync } from "fs";
import { ChartConfig } from "./LineChart";

const filePath = "config.json";
const encoding = "utf-8";

export function getUserConfig(): ChartConfig[] {
  return JSON.parse(readFileSync(filePath, { encoding }));
}

export function writeUserConfig(data: ChartConfig[]) {
  data.forEach((config) => {
    config.data.datasets.forEach((dataset) => {
      dataset.data = []; // eslint-disable-line no-param-reassign
    });
  });
  writeFileSync(filePath, JSON.stringify(data, null, 2), { encoding });
}
