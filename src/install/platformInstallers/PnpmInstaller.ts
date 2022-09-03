import { exec, run } from "../../utils/cmd.js";
import { PlatformInstallerBase } from "./PlatformInstallerBase.js";

export class PnpmInstaller extends PlatformInstallerBase {
  public get isInstalled(): Promise<boolean> {
    return (async () => {
      try {
        const result = await run(`pnpm ls -gp ${this.id}`);
        return !!result.trim();
      } catch {}
      return false;
    })();
  }
  public async installOrUpdate(): Promise<void> {
    await exec(`pnpm add -g ${this.id}@latest`);
  }
  public async update(): Promise<void> {
    await exec(`pnpm add -g ${this.id}@latest`);
  }
  public async uninstall(): Promise<void> {
    await exec(`pnpm remove -g ${this.id}`);
  }
}
