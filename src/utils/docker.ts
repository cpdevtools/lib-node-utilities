import { existsSync } from "fs";
import { join } from "path";
import { importChalk } from "./chalk";
import { exec, run } from "./cmd";
import { sleep } from "./sleep";
import { isApplicationRunning } from "./windows";
import { readWindowsEnv, translateWindowsPath } from "./wsl";

export async function dockerLogin(url: string, user: string, token: string) {
  const chalk = await importChalk();
  console.info(`Attempting to log docker into ${chalk.blueBright(url)} with user ${chalk.yellowBright(user)}`);
  const result = await exec(`echo "${token}" | docker login ${url} -u ${user} --password-stdin`);
  return !result;
}

export async function getDockerDesktopPath() {
  const path = await translateWindowsPath("C:\\Program Files\\Docker\\Docker");
  return path;
}

export async function startDockerDesktop() {
  try {
    const cmd = `"${await getDockerDesktopPath()}/Docker Desktop.exe" &`;
    await exec(cmd);
    const dockerConfigPath = await getDockerDesktopConfigPath();
    while (!existsSync(dockerConfigPath)) {
      await sleep(500);
    }
  } catch (e) {
    throw e;
  }
}

export async function restartDockerDesktop() {
  const chalk = await importChalk();
  console.info(chalk.gray("Restarting Docker Desktop..."));
  await killDockerDesktop();
  await startDockerDesktop();
  await waitForDockerInit(true);
}

export async function isDockerDesktopRunning() {
  return await isApplicationRunning("Docker Desktop.exe");
}

export async function isDockerRunning() {
  try {
    await throwIfDockerNotRunning();
    return true;
  } catch {}
  return false;
}

export async function throwIfDockerNotRunning() {
  try {
    await run("docker info");
  } catch {
    throw new Error(`Docker is not running`);
  }
}
export async function throwIfDockerDesktopNotRunning() {
  if (!(await isDockerDesktopRunning())) {
    throw new Error(`Docker Desktop is not running`);
  }
}

export async function getDockerDesktopConfigPath() {
  const dataPath = (await translateWindowsPath(await readWindowsEnv("appdata"))).trim();
  return join(dataPath, "Docker", "settings.json");
}

export async function killDockerDesktop() {
  try {
    return await run('taskkill.exe /IM "Docker Desktop.exe" /F');
  } catch {
    return false;
  }
}

export async function waitForDockerInit(isRestart: boolean = false) {
  const chalk = await importChalk();
  let c = 0;
  const headerDelay = isRestart ? 120 : 8;
  while (c !== -1) {
    try {
      if (c < headerDelay) {
        c++;
      } else if (c === headerDelay) {
        if (isRestart) {
          console.info();
          console.info(chalk.yellow("********************************************************************"));
          console.info(chalk.yellow("* Waiting for docker to restart...                                 *"));
          console.info(chalk.yellow("*                                                                  *"));
          console.info(chalk.yellow("* If it fails to start automatically make sure it is running       *"));
          console.info(chalk.yellow("* and if nessisarry execute a restart from the taskbar menu.       *"));
          console.info(chalk.yellow("*                                                                  *"));
          console.info(chalk.yellow("* Sure is taking it's time          (╯°□°)╯︵ ┻━┻                 *"));
          console.info(chalk.yellow("********************************************************************"));
          console.info();
        } else {
          console.info();
          console.info(chalk.yellow("********************************************************************"));
          console.info(chalk.yellow("* Waiting for access to docker                                     *"));
          console.info(chalk.yellow("*                                                                  *"));
          console.info(chalk.yellow("* Please make sure that docker desktop is running and restart      *"));
          console.info(chalk.yellow("* the service if nessisarry                                        *"));
          console.info(chalk.yellow("********************************************************************"));
          console.info();
        }
        c++;
      }
      await throwIfDockerNotRunning();
      if (c >= headerDelay) {
        if (isRestart) {
          console.info(chalk.grey("Docker is ready.                     ┬─┬ノ(º_ºノ)"));
        } else {
          console.info(chalk.grey("Docker is ready."));
        }
      }
      c = -1;
    } catch {
      await sleep(3750);
    }
  }
}
