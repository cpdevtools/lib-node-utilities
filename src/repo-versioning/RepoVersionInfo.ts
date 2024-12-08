import { SemVer } from "semver";

export interface IRepoVersionInfo {
  /**
   * A list of versions that have been released.
   * The versions are in semver format and are derived from the tags on remote/origin.
   * Tags must be in semver format to be considered as a version.
   */
  readonly releasedVersions: SemVer[];

  /**
   * The highest release version including pre-releases.
   */
  readonly nextVersion: string | null;
  /**
   * The highest release version excluding pre-releases.
   */
  readonly latestVersion: string | null;

  workingVersions: SemVer[];
}
