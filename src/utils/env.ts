import { readFile, writeFile } from "fs/promises";
import os from "os";
import { join } from "path";
import { run } from "./cmd";
const homedir = os.homedir();

/**
 * Returns a map of all environment variables
 * @returns A map of all environment variables
 * @example
 * const env = await envVars();
 */
export async function envVars(): Promise<{ [key: string]: string }>;
/**
 * Returns the value of the environment variable
 * @param key The name of the environment variable
 * @returns The value of the environment variable
 * @example
 * const value = await envVars("PATH");
 * console.log(value);
 */
export async function envVars(key: string): Promise<string>;
/**
 * Sets the value of the environment variable
 * @param key The name of the environment variable
 * @param value The value of the environment variable
 * @example
 * await envVars("PATH", "/usr/bin");
 */
export async function envVars(key: string, value: string | null): Promise<undefined>;
export async function envVars(key?: string, value?: string | null): Promise<{ [key: string]: string } | string | undefined> {
  if (typeof key !== "string") {
    const result = await run("env");
    const lines = result.split("\n").map((l) => l.trim());
    const env: { [key: string]: string } = {};
    lines.forEach((l) => {
      const p = l.split("=");
      env[p.shift() as string] = p.join("=");
    });
    return env;
  } else if (value === undefined) {
    const env = (await envVars()) as { [key: string]: string };
    return env[key];
  } else if (value === null) {
    await deleteEnvVar(key);
  } else {
    await setEnvVar(key, value);
  }
}

async function deleteEnvVar(name: string) {
  const NAME = name.toUpperCase();
  const path = join(homedir, ".bashrc");
  const lines = (await readFile(path, { encoding: "utf-8" })).split("\n").map((l) => l.trimEnd());
  const idx = lines.findIndex((i) => i.startsWith(`export ${NAME}=`));
  if (~idx) {
    lines.splice(idx, 1);
    delete process.env[NAME];
    await writeFile(path, lines.join("\n"), "utf-8");
  }
}

async function setEnvVar(name: string, value: string) {
  const NAME = name.toUpperCase();
  const path = join(homedir, ".bashrc");
  const exportStr = `export ${NAME}=${value}`;
  const lines = (await readFile(path, { encoding: "utf-8" })).split("\n").map((l) => l.trimEnd());
  const idx = lines.findIndex((i) => i.startsWith(`export ${NAME}=`));
  if (~idx) {
    lines[idx] = exportStr;
  } else {
    lines.push(exportStr);
  }
  process.env[name] = value;
  await writeFile(path, lines.join("\n"), "utf-8");
}

export async function setWindowsEnv(name: string, value: string | null) {
  try {
    if (value === null) {
      await run(`setx.exe ${name} ''`);
    } else {
      await run(`setx.exe ${name} "${value}"`);
    }
    process.env[name] = value ?? undefined;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export function getEnv(name: string): string | null {
  return process.env[name] ?? null;
}
