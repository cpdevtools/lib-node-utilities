import { Class } from "type-fest";
import { KnownPlatforms } from "../platform/KnownPlatforms.js";
import { PlatformInstaller } from "../platform/PlatformInstaller.js";

export declare type InstallerPlatforms = {
  [platform in KnownPlatforms]?: Class<PlatformInstaller>;
};
