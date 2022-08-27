import { IPackageHandler } from "./IPackageHandler.js";

export interface WorkspaceCallResult {
  package: IPackageHandler;
  success: boolean;
}
