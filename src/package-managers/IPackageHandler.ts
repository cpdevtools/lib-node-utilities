import { PackageJson } from "type-fest";
import { RunScriptOptions } from "./RunScriptOptions";
import { WorkspaceCallError } from "./WorkspaceCallError";
import { WorkspaceCallOptions } from "./WorkspaceCallOptions";
import { WorkspaceCallSuccess } from "./WorkspaceCallSuccess";
import { WorkspaceSortingOptions } from "./WorkspaceSortingOptions";

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

  listWorkspacePackages(): Promise<IPackageHandler[]>;
  listWorkspaceNames(): Promise<(string | undefined)[]>;
  listWorkspacePaths(): Promise<(string | undefined)[]>;

  listWorkspacePackagesInTaskOrder(options: Partial<WorkspaceSortingOptions>): Promise<IPackageHandler[][]>;
  hasScript(script: string): boolean;

  readonly name?: string;
  readonly path: string;
  readonly fileName: string;
  readonly fileType: string;
  readonly version?: string;
  readonly packageJson: PackageJson;
  readonly dependencies: PackageJson.Dependency;
  readonly devDependencies: PackageJson.Dependency;
  readonly peerDependencies: PackageJson.Dependency;
  readonly optionalDependencies: PackageJson.Dependency;
  readonly dependencyNames: string[];
  readonly devDependencyNames: string[];
  readonly peerDependencyNames: string[];
  readonly optionalDependencyNames: string[];
}
