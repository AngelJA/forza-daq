import { readFileSync } from "fs";
import { ChartData } from "chart.js";
import { fields } from "./forzaData";

export default function userConfig() {
  const data = JSON.parse(readFileSync("config.json", { encoding: "utf-8" }));
  data.chart.configs.forEach(
    (config: { data: ChartData; fields: string[] }) => {
      config.fields.forEach((f, i) => {
        config.data.datasets[i].label = // eslint-disable-line no-param-reassign
          fields[f as keyof typeof fields].displayName;
      });
    }
  );
  return data;
}
