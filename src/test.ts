import { existsSync } from "fs";
import { SemVer, parse } from "semver";
import { PackageJson } from "type-fest";
import { gitBranches, gitTags, readJsonFile } from "utils";

async function getReleaseVersions(path: string) {
  const tags = await gitTags(path);
  return (
    tags.all
      .filter((tag) => tag.startsWith("v"))
      .map((tag) => parse(tag))
      .filter((tag) => !!tag) as SemVer[]
  ).sort((a, b) => a.compare(b) * -1);
}
type BranchVersion = {
  type: string;
  version: SemVer;
};

async function getVersionBranches(path: string) {
  const branches = await gitBranches(path);
  const verBranches = (
    branches.all
      .filter((branch) => branch.startsWith("remotes/origin/"))
      .map((branch) => branch.replace("remotes/origin/", "").split("/"))
      .filter((branch) => branch.length === 2)
      .map((branch) => ({ type: branch[0], version: parse(branch[1]) }))
      .filter((branch) => !!branch.version) as { type: string; version: SemVer }[]
  ).sort((a, b) => a.version.compare(b.version) * -1) as BranchVersion[];

  const groupedByType: Record<string, BranchVersion[]> = {};
  verBranches.forEach((branch) => {
    groupedByType[branch.type] ??= [];
    groupedByType[branch.type].push(branch);
    groupedByType[branch.type].sort((a, b) => a.version.compare(b.version) * -1);
  });

  return groupedByType;
}

async function getCurrentBranchVersion(path: string) {
  const branches = await gitBranches(path);
  if (branches.current === "main") {
    return { type: "next", version: parse("0.0.0")! };
  }

  const p = branches.current.split("/");
  const version = parse(p[1]);
  return version ? ({ type: p[0], version } as BranchVersion) : null;
}

async function getPackageVersion(path: string) {
  path = `${path}/package.json`;
  if (existsSync(path)) {
    const pkg = await readJsonFile<PackageJson>(path);
    return parse(pkg.version);
  }
  return null;
}

export class RepoVersionInfo {
  public static async load(path: string) {
    return new RepoVersionInfo(
      await getPackageVersion(path),
      await getCurrentBranchVersion(path),
      await getReleaseVersions(path),
      await getVersionBranches(path)
    );
  }

  private constructor(
    public readonly packageVersion: SemVer | null,
    private readonly _currentBranchVersion: BranchVersion | null,
    public readonly releasedVersions: SemVer[],
    public readonly branchVersions: Record<string, BranchVersion[]>
  ) {}

  public get currentBranchVersion(): BranchVersion | null {
    return this._currentBranchVersion?.type === "next"
      ? {
          type: "next",
          version: this.nextVersion ? parse(this.nextVersion)! : parse("0.0.0")!,
        }
      : this._currentBranchVersion;
  }

  get nextVersion(): string | null {
    return this.releasedVersions.sort((a, b) => a.compare(b) * -1)[0]?.version ?? "";
  }

  get latestVersion(): string | null {
    return this.releasedVersions.filter((tag) => tag.prerelease.length === 0).sort((a, b) => a.compare(b) * -1)[0]?.version ?? null;
  }

  get releaseBranches() {
    return this.branchVersions.release ?? null;
  }

  get mainReleaseVersions() {
    return Array.from(new Set(this.releasedVersions.map((v) => parse(`${v.major}.${v.minor}.${v.patch}`))));
  }

  hasReleaseVersion(version: string | SemVer | null) {
    const v = parse(version);
    if (!v) return false;
    return this.releasedVersions.some((tag) => tag.compare(v) === 0);
  }

  hasBranchVersion(version: string | SemVer | null, type?: string) {
    const v = parse(version);
    if (!v) return false;
    if (type) {
      return this.branchVersions[type]?.some((tag) => tag.version.compare(v) === 0) ?? false;
    }
    return Object.values(this.branchVersions).some((tags) => tags.some((tag) => tag.version.compare(v) === 0));
  }

  toJSON() {
    const bVersions: any = {};
    Object.entries(this.branchVersions).forEach(([key, value]) => {
      bVersions[key] = value.map((v) => v.version.version);
    });

    return {
      packageVersion: this.packageVersion?.version ?? null,
      currentBranchVersion: this.currentBranchVersion?.version.version ?? null,
      releasedVersions: this.releasedVersions.map((v) => v.version),
      branchVersions: bVersions,
      nextVersion: this.nextVersion,
      latestVersion: this.latestVersion,
    };
  }
}

async function getRepoVersionInfo(path: string) {
  return RepoVersionInfo.load(path);
}

async function cmdCreateVersion(path: string, version: string, baseVersion: string = "auto") {
  const ver = parse(version);
  if (!ver) {
    throw new Error(`Invalid version: ${version}`);
  }
  const info = await RepoVersionInfo.load(path);

  if (info.hasReleaseVersion(ver)) {
    throw new Error(`Version ${version} already exists`);
  }

  if (baseVersion === "auto" && info.currentBranchVersion?.type === "next") {
    baseVersion = info.nextVersion ?? "auto";
  }

  if (baseVersion === "auto") {
    const idx = info.mainReleaseVersions.findIndex((v) => v?.compare(ver) === -1);
    if (idx === -1) {
      baseVersion = "0.0.0";
    } else {
      baseVersion = info.mainReleaseVersions[idx]?.version ?? "0.0.0";
    }
  }

  const base = parse(baseVersion)!;
  if (!info.hasReleaseVersion(base)) {
    throw new Error(`Base version '${baseVersion}' does not exist`);
  }
  if (ver.compare(base) !== 1) {
    throw new Error(`Version'${version}' must be greater than base version '${baseVersion}'`);
  }

  if (!info.hasBranchVersion(base, "v")) {
    // create working branch
    if (info.currentBranchVersion?.type === "next") {
      console.log(`Creating working branch: v/${ver.version} from branch: main`);
    } else if (info.currentBranchVersion?.version.compare(base) === 0) {
      console.log(
        `Creating working branch: v/${ver.version} from branch: ${info.currentBranchVersion.type}/${info.currentBranchVersion.version}`
      );
    } else {
      console.log(`Creating working branch: v/${ver.version} from tag: v${base.version}`);
    }
  }

  if (!info.hasBranchVersion(base, "release")) {
    // create release branch
    console.log(`Creating release branch: release/${ver.version} from tag: v${base.version}`);
  }
}

(async () => {
  // const info = await getRepoVersionInfo(".");
  // console.log(info.toJSON());

  await cmdCreateVersion(".", "1.0.0");
})();
