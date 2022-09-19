import semVer from "semver";
import { importChalk } from "./chalk";
import { exec, run } from "./cmd";
import { isWin10, isWindows } from "./windows";

export async function translateWindowsPath(path: string): Promise<string> {
  const result = await (await run(`wslpath -a -u "${path}"`)).trim();
  return result;
}
export async function translateWslPath(path: string): Promise<string> {
  try {
    return (await run(`wslpath -a -w "${path}"`)).trim();
  } catch {
    return path;
  }
}

export async function getWslVersion() {
  try {
    const verStr = ((await run(`wsl.exe --status`)) ?? "")
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.includes("Kernel version:"))
      ?.split(":")?.[1]
      ?.trim();

    if (verStr) {
      const p = verStr.split(".");
      const l = p.pop();
      return semVer.parse(`${p.join(".")}-${l}`, true);
    }
  } catch {}
  return null;
}

export async function getWslDefaultVersion() {
  const verStr =
    (await run(`wsl.exe --status`))
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.includes("Default Version:"))
      ?.split(":")?.[1]
      ?.trim() ?? "0";

  return Number.isNaN(+verStr) ? 0 : +verStr;
}

export async function isWslInstalled() {
  return (await getWslVersion()) !== null;
}

export async function installWSL() {
  if (isWindows) {
    if (isWin10) {
      console.info(`Enabling Windows Subsystem Linux (this could take a while)...`);
      await exec(`dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart`);
      console.info(`Enabling Virtual Machine Platform (this could also take a while)...`);
      await exec(`dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart`);
    } else {
      await exec(`wsl --install`);
    }
  }
}

export async function updateWSL() {
  const chalk = await importChalk();
  if (isWindows) {
    if (isWin10) {
      console.info(chalk.gray(`Applying wsl update for windows 10...`));
      await exec(`curl --ssl https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi > uwsl.msi && uwsl.msi`);
    }
    console.info(chalk.gray(`Updating wsl...`));
    await run(`wsl --update`);
    console.info(chalk.gray(`Restarting wsl...`));
    await run(`wsl --shutdown`);
    console.info(chalk.gray(`Setting wsl 2 as default`));
    await run(`wsl --set-default-version 2 > nul 2>&1`);
  }
}

export async function isWslDistroInstalled(name: string) {
  return (await listWslDistributions()).includes(name);
}

export async function listWslDistributions() {
  return (await run("wsl.exe --list")).split("\n").map((l) => l.trim());
}

export async function readWindowsEnv(name: string) {
  return (await run(`cmd.exe /c echo %${name}%`)).trim();
}
