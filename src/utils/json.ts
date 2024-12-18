import { readFile, writeFile } from "fs/promises";
import { jsonc } from "jsonc";

export async function readJsonFile<T = unknown>(path: string): Promise<T> {
  return jsonc.parse(await readFile(path, { encoding: "utf-8" }));
}

export async function writeJsonFile(path: string, data: any, indent?: number) {
  await writeFile(path, jsonc.stringify(data, { space: indent, handleCircular: true }));
}
