import { writeFile } from "fs/promises";
import path from "path";
import semVer from "semver";
import { importChalk } from "./chalk";
import { run } from "./cmd";
import { execAsWindowsAdmin, isWin10, isWindows } from "./windows";

export async function translateWindowsPath(path: string): Promise<string> {
  const result = (await run(`wslpath -a -u "${path}"`)).trim();
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
      const p = verStr.split(".").slice(0, 3);
      return semVer.parse(`${p.join(".")}`, true);
    }
  } catch {}
  return null;
}

export async function getWslDefaultVersion() {
  try {
    const verStr =
      (await run(`wsl.exe --status`))
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.includes("Default Version:"))
        ?.split(":")?.[1]
        ?.trim() ?? "0";

    return Number.isNaN(+verStr) ? 0 : +verStr;
  } catch {}
  return 0;
}

export async function isWslInstalled() {
  return (await getWslVersion()) !== null;
}

export async function installWSL() {
  if (isWindows) {
    const p = path.join(process.env["temp"] ?? "", `installWSL.cmd`);

    await writeFile(
      p,
      `
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
    `,
      { encoding: "utf-8" }
    );

    await execAsWindowsAdmin([p]);
    return true;
    /*
        console.info(`Enabling Windows Subsystem Linux (this could take a while)...`);
        await execAsWindowsAdmin([
          `dism.exe`,
          `/online`,
          `/enable-feature`,
          `/featurename:Microsoft-Windows-Subsystem-Linux`,
          `/all`,
          `/norestart`,
        ]);
        console.info(`Enabling Virtual Machine Platform (this could also take a while)...`);
        await execAsWindowsAdmin([`dism.exe`, `/online`, `/enable-feature`, `/featurename:VirtualMachinePlatform`, `/all`, `/norestart`]);
        await execAsWindowsAdmsin([`wsl`, ` --set-default-version`, ` 2 > nul`, `2>&1`]);


    */

    /*
        if (isWin10) {
        } else {
          await execAsWindowsAdmin([`wsl`, `--install`]);
        }

        */
  }
  return false;
}

export async function updateWSL() {
  const chalk = await importChalk();
  if (isWindows) {
    if (isWin10) {
      console.info(chalk.gray(`Applying wsl update for windows 10...`));
      await execAsWindowsAdmin([
        `curl`,
        `--ssl`,
        `https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi`,
        `> uwsl.msi`,
        `&& uwsl.msi`,
      ]);
    }
    console.info(chalk.gray(`Updating wsl...`));
    await execAsWindowsAdmin([`wsl`, `--update`]);
    console.info(chalk.gray(`Restarting wsl...`));
    await execAsWindowsAdmin([`wsl`, `--shutdown`]);
    console.info(chalk.gray(`Setting wsl 2 as default`));
  }
}

export async function isWslDistroInstalled(name: string) {
  return (await listWslDistributions()).includes(name);
}

export async function listWslDistributions() {
  return (await run("wsl.exe --list")).split("\n").map((l) => l.trim());
}

export async function readWindowsEnv(name: string) {
  return cleanValue(await run(`cmd.exe /c echo %${name}%`)).trim();
}

function cleanValue(val: string) {
  val = val.trim().split("\n").pop()?.trim() ?? "";
  if ((val.startsWith(`'`) && val.endsWith(`'`)) || (val.startsWith(`"`) && val.endsWith(`"`))) {
    return val.slice(1, -1);
  }
  return val;
}
