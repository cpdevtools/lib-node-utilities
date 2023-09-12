import { existsSync } from "fs";
import { PackageJson } from "type-fest";
import { readYamlFile } from "../../utils";
import { Package } from "./Package";

export class PnpmPackage extends Package {
  public static async detect(data: PackageJson, path: string, filename: string) {
    return true;
  }

  protected execPackageManager(cmd: string): Promise<number> {
    return this.execCmd(`pnpm ${cmd}`);
  }

  public override async load(): Promise<void> {
    if (this.isWorkspace) {
      const ws = await readYamlFile<any>("pnpm-workspace.yaml");
      this.data.workspaces = ws.packages ?? [];
    }
  }

  public override get isWorkspace() {
    return existsSync("pnpm-workspace.yaml");
  }
}
