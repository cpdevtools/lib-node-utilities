import { exec, run } from "../../utils/cmd";
import { PlatformInstallerBase } from "./PlatformInstallerBase";

export class YarnInstaller extends PlatformInstallerBase {
  public get isInstalled(): Promise<boolean> {
    return (async () => {
      try {
        const result = await run(`yarn global list --pattern ${this.id}`);
        return !!result.trim();
      } catch {}
      return false;
    })();
  }

  public async installOrUpdate(): Promise<void> {
    await exec(`yarn global add -g ${this.id}@latest`);
  }

  public async update(): Promise<void> {
    await exec(`yarn global add -g ${this.id}@latest`);
  }

  public async uninstall(): Promise<void> {
    await exec(`yarn global remove -g ${this.id}`);
  }
}
