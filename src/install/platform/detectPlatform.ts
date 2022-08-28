import isWsl from "is-wsl";
import os from "os";
import { Platform } from "./Platform.js";

export function detectPlatform(): Platform {
  if (isWsl) {
    return Platform.WSL;
  }
  /*if (isDocker()) {
    return Platform.UNKNOWN;
  }*/
  if (os.platform() === "linux") {
    return Platform.LINUX;
  }
  return Platform.UNKNOWN;
}
