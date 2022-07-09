import { readFileSync } from "fs";
import { ChartData } from "chart.js";
import { fields } from "./forzaData";

const data = readFileSync("config.json", { encoding: "utf-8" });
export const c = JSON.parse(data);

c.chart.configs.forEach((config: { data: ChartData; fields: string[] }) => {
  config.fields.forEach((f, i) => {
    config.data.datasets[i].label = // eslint-disable-line no-param-reassign
      fields[f as keyof typeof fields].displayName;
  });
});

export default c;
