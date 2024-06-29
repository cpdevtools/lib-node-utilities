import { SemVer, parse } from "semver";
import { gitBranches, gitTags } from "utils";

async function getReleaseVersions(path: string) {
  const tags = await gitTags(path);
  return tags.all
    .filter((tag) => tag.startsWith("v"))
    .map((tag) => parse(tag))
    .filter((tag) => !!tag) as SemVer[];
}
type BranchVersion = {
  type: string;
  version: SemVer;
};

async function getVersionBranches(path: string) {
  const branches = await gitBranches(path);
  const verBranches = branches.all
    .filter((branch) => branch.startsWith("remotes/origin/"))
    .map((branch) => branch.replace("remotes/origin/", "").split("/"))
    .filter((branch) => branch.length === 2 && branch[1].startsWith("v"))
    .map((branch) => ({ type: branch[0], version: parse(branch[1]) }))
    .filter((branch) => !!branch.version) as { type: string; version: SemVer }[];

  const groupedByType: Record<string, BranchVersion[]> = {};
  verBranches.forEach((branch) => {
    groupedByType[branch.type] ??= [];
    groupedByType[branch.type].push(branch);
  });

  return groupedByType;
}

export class RepoVersionInfo {
  public static async load(path: string) {
    return new RepoVersionInfo(await getReleaseVersions(path), await getVersionBranches(path));
  }

  get nextVersion(): string | null {
    return this.releasedVersions.sort((a, b) => a.compare(b) * -1)[0]?.version ?? "";
  }

  get latestVersion(): string | null {
    return this.releasedVersions.filter((tag) => tag.prerelease.length === 0).sort((a, b) => a.compare(b) * -1)[0]?.version ?? null;
  }

  private constructor(public readonly releasedVersions: SemVer[], public readonly branchVersions: Record<string, BranchVersion[]>) {}

  toJSON() {
    const bVersions: any = {};
    Object.entries(this.branchVersions).forEach(([key, value]) => {
      bVersions[key] = value.map((v) => v.version.version);
    });

    return {
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

(async () => {
  const info = await getRepoVersionInfo(".");
  console.log(info.toJSON());
})();
