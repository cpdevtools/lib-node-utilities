import { extname } from "path";

import { spawn } from "child_process";
import Path from "path/posix";
import { exec, run } from "./cmd";
import { translateWslPath } from "./wsl";
import isWsl from "is-wsl";

export function launchVSCode(path: string = ".") {
  spawn(`code ${path}`, { shell: true, detached: true, stdio: "ignore" });
}

export async function getContainerLaunchUrl(containerPath: string, workspace?: string) {
  const hexPath = Buffer.from(await translateWslPath(containerPath)).toString("hex");
  return `vscode-remote://dev-container+${Path.join(hexPath, workspace ?? "")}`;
}

export function launchContainerUrl(launchUrl: string) {
  const isWS = launchUrl.endsWith(".code-workspace");
  const flag = isWS ? "file-uri" : "folder-uri";
  const cmd = `code --${flag} "${launchUrl}"`;
  spawn(cmd, { shell: true, detached: true, stdio: "ignore" });
}

export async function launchVSCodeDevContainer(containerPath: string = ".", open?: string) {
  const isWS = extname(open ?? "") === ".code-workspace";
  const flag = isWS ? "file-uri" : "folder-uri";
  const hexPath = Buffer.from(await translateWslPath(containerPath)).toString("hex");
  let uri = `vscode-remote://dev-container+${hexPath}/${open ?? ""}`;
  const cmd = `code --${flag} "${uri}"`;
  spawn(cmd, { shell: true, detached: true, stdio: "ignore" });
}

export async function installVSCodeExtension(idOrPath: string, options?: { preRelease?: boolean; force?: boolean }) {
  const cmd = isWsl ? "cd /mnt/c/ && cmd.exe /c code" : "code";
  const command = `${cmd} --install-extension ${idOrPath} ${options?.preRelease ? "--pre-release" : ""} ${options?.force ? "--force" : ""}`;
  await exec(command);
}

export async function uninstallVSCodeExtension(id: string) {
  const command = `code --uninstall-extension ${id} `;
  await exec(command);
}

export async function killVsCode() {
  try {
    return await run('taskkill.exe /IM "Code.exe" /F');
  } catch {
    return false;
  }
}
