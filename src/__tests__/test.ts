import { readFileSync } from "fs";
import { parseForzaData } from "../forzaData";

test("parse binary data correctly", () => {
  const binFile = readFileSync("src/__tests__/testdata.bin");
  const values = parseForzaData(binFile);
  const jsonFile = readFileSync("src/__tests__/testdata.json");
  const expectedValues = JSON.parse(jsonFile.toString());
  expect(values).toStrictEqual(expectedValues);
});

export {};
