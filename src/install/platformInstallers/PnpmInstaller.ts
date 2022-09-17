import { exec, run } from "../../utils/cmd";
import { PlatformInstallerBase } from "./PlatformInstallerBase";

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
