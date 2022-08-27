import { IPackageHandlerType } from "../IPackageHandlerType.js";
import { NpmPackage } from "./NpmPackage.js";
import { PnpmPackage } from "./PNpmPackage.js";
import { YarnPackage } from "./YarnPackage.js";

export const PACKAGE_TYPES: IPackageHandlerType[] = [PnpmPackage, YarnPackage, NpmPackage];
