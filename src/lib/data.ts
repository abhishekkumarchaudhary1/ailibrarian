import { promises as fs } from "fs";
import path from "path";
import type { MainData } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "maindata.json");

export async function getData(): Promise<MainData> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as MainData;
}

export async function saveData(data: MainData): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}
