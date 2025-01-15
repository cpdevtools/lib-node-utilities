import { existsSync } from "fs";
import { PackageJson } from "type-fest";
import { readYamlFile } from "../../utils";
import { Package } from "./Package";

export class PnpmPackage extends Package {
  public static async detect(data: PackageJson & { packageManager: string }, path: string, filename: string) {
    if (data.packageManager?.startsWith("pnpm")) return true;
    if (existsSync(`${path}/pnpm-lock.yaml`)) return true;
    return false;
  }

  protected execPackageManager(cmd: string): Promise<number> {
    return this.execCmd(`pnpm ${cmd}`);
  }

  public override async load(): Promise<void> {
    if (this.isWorkspace) {
      const ws = await readYamlFile<any>("pnpm-workspace.yaml");
      this.packageJson.workspaces = ws.packages ?? [];
    }
  }

  public override get isWorkspace() {
    return existsSync("pnpm-workspace.yaml");
  }
}
