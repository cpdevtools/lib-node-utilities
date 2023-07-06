import { readFile, writeFile } from "fs/promises";

export async function readJsonFile<T = unknown>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, { encoding: "utf-8" }));
}

export async function writeJsonFile(path: string, data: any, indent?: number) {
  await writeFile(path, JSON.stringify(data, undefined, indent));
}
