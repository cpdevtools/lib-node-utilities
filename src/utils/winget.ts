import { existsSync } from "fs";
import sha256File from "sha256-file";
import yaml from "yaml";
import { importChalk } from "./chalk";
import { exec, run } from "./cmd";

export interface WingetPackage {
  id: string;
  name: string;
  required?: boolean;
  version?: string;
  category?: string;
  description?: string;
}

export async function isInstalledWsl(id: string) {
  try {
    await run(`winget.exe list -e --id ${id}`);
    return true;
  } catch (e: any) {
    if (e.code === 20) {
      return false;
    }
    throw e;
  }
}

interface WingetInstallerInfoRaw {
  Type: string;
  Locale: string;
  "Download Url": string;
  SHA256: string;
  "Release Date": string;
}
interface WingetInfoRaw {
  Version: string;
  Publisher: string;
  "Publisher Url": string;
  "Publisher Support Url": string;
  Author: string;
  Moniker: string;
  Description: string;
  Homepage: string;
  License: string;
  Copyright: string;
  Installer: WingetInstallerInfoRaw;
}
export interface WingetInfo {
  id: string;
  version: string;
  publisher: string;
  publisherUrl: string;
  publisherSupportUrl: string;
  author: string;
  moniker: string;
  description: string;
  homepage: string;
  license: string;
  copyright: string;
  installer: WingetInstallerInfo;
}

export interface WingetInstallerInfo {
  type: string;
  locale: string;
  downloadUrl: string;
  SHA256: string;
  releaseDate: string;
}

export async function wingetInfo(id: string): Promise<WingetInfo> {
  const result = await run(`winget.exe show -e --id ${id}`);
  const raw = yaml.parse(result.slice(result.indexOf("\n")).trim()) as WingetInfoRaw;
  return {
    id,
    author: raw.Author,
    copyright: raw.Copyright,
    description: raw.Description,
    homepage: raw.Homepage,
    license: raw.License,
    moniker: raw.Moniker,
    publisher: raw.Publisher,
    publisherSupportUrl: raw["Publisher Support Url"],
    publisherUrl: raw["Publisher Url"],
    version: raw.Version,
    installer: {
      downloadUrl: raw.Installer["Download Url"],
      locale: raw.Installer.Locale,
      releaseDate: raw.Installer["Release Date"],
      SHA256: raw.Installer.SHA256,
      type: raw.Installer.Type,
    },
  };
}

export async function isValidInstallFile(filepath: string, id: string): Promise<boolean> {
  if (existsSync(filepath)) {
    const [info, sha] = await Promise.all([
      wingetInfo(id),
      new Promise<string>((res, rej) => sha256File(filepath, (error, check) => (error ? rej(error) : res(check!)))),
    ]);
    return info.installer.SHA256 === sha;
  }
  return false;
}

export async function installWinget(id: string) {
  const chalk = await importChalk();
  console.info(chalk.greenBright(`${chalk.cyanBright(id)}: Installing...`));
  console.info();
  const result = await exec(`winget.exe install -e --id ${id}`);
  console.info();
  console.info();
  return result;
}

export async function uninstallWinget(id: string) {
  const chalk = await importChalk();
  console.info(chalk.greenBright(`${chalk.cyanBright(id)}: Uninstalling...`));
  console.info();
  const result = await exec(`winget.exe uninstall -e --id ${id}`);
  console.info();
  console.info();
  return result;
}

export async function updateWinget(id: string, args?: string) {
  const chalk = await importChalk();
  console.info(chalk.blueBright(`${chalk.cyanBright(id)}: Checking for updates...`));
  console.info();
  const result = await exec(`winget.exe upgrade -he --verbose-logs --id ${id}${args ? " " + args : ""}`);
  console.info();
  console.info();
  return result;
}

export async function updateOrInstallWinget(id: string) {
  if (await isInstalledWsl(id)) {
    return await updateWinget(id);
  }
  return await installWinget(id);
}

(async () => {
  const info = await wingetInfo("Canonical.Ubuntu.2204");
  console.log(info);
})();
