import { PackageJson } from "type-fest";
import { RunScriptOptions } from "./RunScriptOptions.js";
import { WorkspaceCallError } from "./WorkspaceCallError.js";
import { WorkspaceCallOptions } from "./WorkspaceCallOptions.js";
import { WorkspaceCallSuccess } from "./WorkspaceCallSuccess.js";
import { WorkspaceSortingOptions } from "./WorkspaceSortingOptions.js";

export interface IPackageHandler {
  runScript(script: string, options?: Partial<RunScriptOptions>): Promise<number | undefined>;
  execCmd(cmd: string): Promise<number>;

  workspaceRunScript(
    cmd: string,
    options: Partial<WorkspaceSortingOptions & RunScriptOptions>
  ): Promise<{
    hasErrors: boolean;
    errors: WorkspaceCallError[];
    results: WorkspaceCallSuccess<number | undefined>[];
  }>;

  workspaceExecute(
    cmd: string,
    options: Partial<WorkspaceSortingOptions & WorkspaceCallOptions>
  ): Promise<{
    hasErrors: boolean;
    errors: WorkspaceCallError[];
    results: WorkspaceCallSuccess<number | undefined>[];
  }>;

  workspaceCall<T, TError = unknown>(
    fn: (pkg: IPackageHandler) => Promise<T>,
    options: Partial<WorkspaceSortingOptions & WorkspaceCallOptions>
  ): Promise<{
    hasErrors: boolean;
    errors: WorkspaceCallError<TError>[];
    results: WorkspaceCallSuccess<T>[];
  }>;

  install(): Promise<number>;
  workspaceInstall(options: Partial<WorkspaceSortingOptions & RunScriptOptions>): Promise<{
    hasErrors: boolean;
    errors: WorkspaceCallError[];
    results: WorkspaceCallSuccess<number | undefined>[];
  }>;

  readonly name?: string;
  readonly dependencies: PackageJson.Dependency;
  readonly devDependencies: PackageJson.Dependency;
  readonly peerDependencies: PackageJson.Dependency;
  readonly optionalDependencies: PackageJson.Dependency;
  readonly dependencyNames: string[];
  readonly devDependencyNames: string[];
  readonly peerDependencyNames: string[];
  readonly optionalDependencyNames: string[];
}
