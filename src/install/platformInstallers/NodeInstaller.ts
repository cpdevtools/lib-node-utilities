import { exec, run } from "../../utils";
import { PlatformInstallerBase } from "./PlatformInstallerBase";

export class NodeInstaller extends PlatformInstallerBase {
  public get isInstalled(): Promise<boolean> {
    return (async () => {
      try {
        const result = await run(`npm ls -gp ${this.id}`);
        return !!result.trim();
      } catch {}
      return false;
    })();
  }
  public async installOrUpdate(): Promise<void> {
    await exec(`npm install -g ${this.id}@latest`);
  }
  public async update(): Promise<void> {
    await exec(`npm install -g ${this.id}@latest`);
  }
  public async uninstall(): Promise<void> {
    await exec(`npm uninstall -g ${this.id}`);
  }
}
