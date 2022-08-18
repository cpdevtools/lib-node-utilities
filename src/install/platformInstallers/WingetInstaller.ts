import { uninstallWinget, updateOrInstallWinget, updateWinget } from "../../utils";
import { PlatformInstallerBase } from "./PlatformInstallerBase";

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
