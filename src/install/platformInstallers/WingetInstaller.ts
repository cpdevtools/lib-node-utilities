import { uninstallWinget, updateOrInstallWinget, updateWinget } from "../../utils/index.js";
import { PlatformInstallerBase } from "./PlatformInstallerBase.js";

export class WingetInstaller extends PlatformInstallerBase {
  public get isInstalled(): Promise<boolean> {
    return (async () => {
      return true;
    })();
  }
  public async installOrUpdate(): Promise<void> {
    await updateOrInstallWinget(this.id);
  }
  public async update(): Promise<void> {
    await updateWinget(this.id);
  }
  public async uninstall(): Promise<void> {
    await uninstallWinget(this.id);
  }
}
