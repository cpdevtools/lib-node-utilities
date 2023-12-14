import { PackageJson } from "type-fest";
import { Package } from "./Package";
import { existsSync } from "fs";

export class YarnPackage extends Package {
  public static async detect(data: PackageJson & { packageManager: string }, path: string, filename: string) {
    if (data.packageManager?.startsWith("yarn")) return true;
    console.log("yarn.lock", existsSync(`${path}/yarn.lock`));
    if (existsSync(`${path}/yarn.lock`)) return true;
    return false;
  }

  protected execPackageManager(cmd: string): Promise<number> {
    return this.execCmd(`yarn ${cmd}`);
  }
}
