import os from "os";
import { promisified as regEdit } from "regedit";
import semver from "semver";
import { run } from "./cmd";
import { translateWindowsPath } from "./wsl";

export interface AppxPackage {
  Name: string;
  Publisher: string;
  Architecture: string;
  ResourceId: string;
  Version: string;
  PackageFullName: string;
  InstallLocation: string;
  IsFramework: string;
  PackageFamilyName: string;
  PublisherId: string;
  IsResourcePackage: string;
  IsBundle: string;
  IsDevelopmentMode: string;
  NonRemovable: string;
  IsPartiallyStaged: string;
  SignatureKind: string;
  Status: string;
}

export async function loadAppxPackages(): Promise<AppxPackage[]> {
  const result = await run(`powershell.exe Get-AppxPackage"`);
  return result
    .split("\n\n")
    .map((appStr) => appStr.trim().split("\n"))
    .map((lines) => {
      const result: any = {};
      lines.forEach((line) => {
        const p = line.split(":", 2);
        result[p[0].trim()] = p[1].trim();
      });
      return result;
    });
}

export async function loadAppxPackage(appxPackageName: string): Promise<AppxPackage | undefined> {
  const packages = await loadAppxPackages();
  return packages.find((p) => p.Name === "appxPackageName");
}

export async function locateInstallationPath(appxPackageName: string): Promise<string | undefined> {
  const pkg = await loadAppxPackage(appxPackageName);
  return pkg?.InstallLocation ? translateWindowsPath(pkg?.InstallLocation) : undefined;
}

export const isWindows = os.platform() === "win32";
export const windowsVer = isWindows ? os.release() : null;
export const windowsVersion = isWindows ? semver.parse(windowsVer) : null;

export const isWin10 = !isWindows ? false : windowsVersion?.major === 10 && windowsVersion?.patch !== 22000;
export const isWin11 = !isWindows ? false : windowsVersion?.major === 10 && windowsVersion?.patch === 22000;

export async function runOnceAfterRestart(id: string, script: string) {
  await regEdit.putValue({
    "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\RunOnce": {
      [id]: {
        value: script,
        type: "REG_SZ",
      },
    },
  });
}

export async function removeRunOnceAfterRestart(id: string) {
  await (regEdit as any).deleteValue(`HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\RunOnce\\${id}`);
}
