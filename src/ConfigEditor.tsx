/* eslint-disable no-param-reassign */
import React, { useState } from "react";
import { ChromePicker, Color, ColorResult } from "react-color";
import { ScaleChartOptions } from "chart.js";
import { ChartConfig } from "./LineChart";
import { fields, FieldsKey } from "./forzaData";
import "./ConfigEditor.css";
import c from "./config.json";

function swap(arr: any[], i: number, j: number) {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

type SubType = React.PropsWithChildren<{
  config: ChartConfig;
  i: number;
  updateConfig: (config: ChartConfig) => void;
}>;

function FieldPicker({ config, i, updateConfig }: SubType) {
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const toggleFieldPicker = () => setShowFieldPicker(!showFieldPicker);
  const keys = Object.keys(fields);
  keys.sort((a: string, b: string): number => {
    const fieldA = fields[a as FieldsKey];
    const fieldB = fields[b as FieldsKey];
    if (fieldA.displayName > fieldB.displayName) {
      return 1;
    }
    return -1;
  });

  return (
    <>
      <button
        type="button"
        onClick={toggleFieldPicker}
        title="Select the data field to display."
      >
        ...
      </button>
      {showFieldPicker && (
        <div className="FieldList">
          {keys.map((key: string) => (
            <div key={fields[key as FieldsKey].displayName}>
              <button
                type="button"
                style={{ width: "20rem" }}
                onClick={() => {
                  const field = fields[key as FieldsKey];
                  config.fields[i] = key;
                  config.data.datasets[i].label = field.displayName;
                  updateConfig(config);
                  toggleFieldPicker();
                }}
              >
                {fields[key as FieldsKey].displayName}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ConfigField({ config, i, updateConfig }: SubType) {
  const dataset = config.data.datasets[i];
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerColor, setPickerColor] = useState(dataset.borderColor as Color);

  return (
    <tr>
      <td>{config.data.datasets[i].label}</td>
      <td>
        <FieldPicker config={config} i={i} updateConfig={updateConfig} />
      </td>
      <td>
        <button
          type="button"
          className="ColorBox"
          style={{
            backgroundColor: dataset.borderColor as string,
          }}
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Select the color for this field."
        >
          <span />
        </button>
        {showColorPicker && (
          <ChromePicker
            onChange={(color: ColorResult) => {
              const alphaHex = Math.trunc(255 * (color.rgb?.a || 0))
                .toString(16)
                .padStart(2, "0");
              const newColor = color.hex + alphaHex;
              setPickerColor(newColor);
              dataset.borderColor = newColor;
              dataset.backgroundColor = newColor;
            }}
            color={pickerColor}
          />
        )}
      </td>
      <td>
        Fill
        <input
          type="checkbox"
          checked={dataset.fill as boolean}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            dataset.fill = event.target.checked;
            updateConfig(config);
          }}
        />
      </td>
      <td>
        Y-Axis{" "}
        <select
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
            dataset.yAxisID = event.target.value;
            updateConfig(config);
          }}
          value={dataset.yAxisID}
        >
          <option value="yLeft">Left</option>
          <option value="yRight">Right</option>
        </select>
      </td>
      <td>
        <button
          type="button"
          onClick={() => {
            if (i > 0) {
              swap(config.fields, i, i - 1);
              swap(config.data.datasets, i, i - 1);
              updateConfig(config);
            }
          }}
          title="Move this field up."
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => {
            if (i < config.fields.length - 1) {
              swap(config.fields, i, i + 1);
              swap(config.data.datasets, i, i + 1);
              updateConfig(config);
            }
          }}
          title="Move this field down."
        >
          ▼
        </button>
      </td>
      <td>
        <button
          type="button"
          onClick={() => {
            config.fields.splice(i, 1);
            config.data.datasets.splice(i, 1);
            updateConfig(config);
          }}
          title="Remove this field."
        >
          ❌
        </button>
      </td>
    </tr>
  );
}

function ConfigAxis({ config, i, updateConfig }: SubType) {
  const scales = () => (config.chartConfig.options as ScaleChartOptions).scales;
  const yAxisID = ["yLeft", "yRight"][i];
  const handleNumericFieldChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const scale = scales()[yAxisID];
      type KeyType = "min" | "max";
      if (event.target.value === "") {
        delete scale[field as KeyType];
      } else {
        const newValue = +event.target.value;
        if (Number.isNaN(newValue)) return;
        scale[field as KeyType] = newValue;
      }
      updateConfig(config);
    };
  const textTitle = "Axis limit. Leave blank for auto.";

  return (
    <tr>
      <td>{["Y-Left", "Y-Right"][i]}</td>
      <td>
        Min{" "}
        <input
          type="text"
          onChange={handleNumericFieldChange("min")}
          value={scales()[yAxisID].min?.toString() || ""}
          title={textTitle}
        />
      </td>
      <td>
        Max{" "}
        <input
          type="text"
          onChange={handleNumericFieldChange("max")}
          value={scales()[yAxisID].max?.toString() || ""}
          title={textTitle}
        />
      </td>
      <td>
        Flip{" "}
        <input
          type="checkbox"
          checked={scales()[yAxisID].reverse}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            scales()[yAxisID].reverse = event.target.checked;
            updateConfig(config);
          }}
        />
      </td>
      <td>
        Show{" "}
        <input
          type="checkbox"
          checked={scales()[yAxisID].ticks.display}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            scales()[yAxisID].ticks.display = event.target.checked;
            updateConfig(config);
          }}
        />
      </td>
    </tr>
  );
}

function ConfigEditor({
  initialConfig,
  doneEditing,
}: React.PropsWithChildren<{
  initialConfig: ChartConfig;
  doneEditing: () => void;
}>) {
  const [config, setConfig] = useState<ChartConfig>(initialConfig);
  const updateConfig = (newConfig: ChartConfig) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      ...newConfig,
    }));
  };

  return (
    // eslint-disable-next-line
    <div
      className="ConfigEditor"
      onClick={(event) => {
        if ((event.target as HTMLDivElement).className === "ConfigEditor") {
          doneEditing();
        }
      }}
    >
      <div className="TableDiv">
        <table>
          <tbody>
            <tr>
              <th>Chart Settings</th>
            </tr>
            <tr>
              <td>
                fps{" "}
                <input
                  value={config?.fps.toString() || ""}
                  type="text"
                  title="Chart update rate."
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (event.target.value === "") {
                      config.fps = 0;
                    } else {
                      const newValue = +event.target.value;
                      if (Number.isNaN(newValue)) return;
                      config.fps = newValue;
                    }
                    updateConfig(config);
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <th colSpan={5}>Scales</th>
            </tr>
            <tr>
              <td>X-Axis</td>
              <td colSpan={4}>
                Length (s):{" "}
                <input
                  value={
                    (config && (config.maxDataPoints / c.logRate).toString()) ||
                    ""
                  }
                  type="text"
                  title="Number of seconds to display on x-axis."
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (event.target.value === "") {
                      config.maxDataPoints = 180;
                    } else {
                      const newValue = +event.target.value * c.logRate;
                      if (Number.isNaN(newValue)) return;
                      config.maxDataPoints = newValue;
                    }
                    updateConfig(config);
                  }}
                />
              </td>
            </tr>
            <ConfigAxis config={config} i={0} updateConfig={updateConfig} />
            <ConfigAxis config={config} i={1} updateConfig={updateConfig} />
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <th colSpan={7}>Fields</th>
            </tr>
            {Object.keys(config.data.datasets).map((i: string) => (
              <ConfigField
                key={i}
                config={config}
                i={+i}
                updateConfig={updateConfig}
              />
            ))}
            <tr>
              <td colSpan={7}>
                <button
                  type="button"
                  style={{ width: "100%" }}
                  onClick={() => {
                    config.fields.push(c.newConfig.field);
                    const i = config.data.datasets.push(
                      // @ts-expect-error cannot find name structuredClone
                      structuredClone(c.newConfig.dataset)
                    );
                    config.data.datasets[i - 1].label =
                      fields[c.newConfig.field as FieldsKey].displayName;
                    updateConfig(config);
                  }}
                >
                  ➕
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ConfigEditor;
