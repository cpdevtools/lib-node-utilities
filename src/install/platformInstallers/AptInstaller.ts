import { exec, run } from "../../utils/cmd.js";
import { PlatformInstallerBase } from "./PlatformInstallerBase.js";

export class AptInstaller extends PlatformInstallerBase {
  public get isInstalled(): Promise<boolean> {
    return (async () => {
      try {
        await run(`apt show ${this.id}`);
        return true;
      } catch {
        return false;
      }
    })();
  }
  public async installOrUpdate(): Promise<void> {
    await exec(`sudo apt install -y ${this.id}`);
  }
  public async update(): Promise<void> {
    await exec(`sudo apt install -y ${this.id}`);
  }
  public async uninstall(): Promise<void> {
    await exec(`sudo apt -y autoremove ${this.id}`);
  }
}
