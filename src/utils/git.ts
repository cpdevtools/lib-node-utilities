import { existsSync } from "fs";
import { simpleGit } from "simple-git";
import { exec } from "./cmd";

export async function getConfig(name: string) {
  const git = simpleGit();
  const result = await git.getConfig(name, "global");
  return result.value;
}

export async function setConfig(name: string, value: string) {
  const git = simpleGit(".");
  const result = await git.addConfig(name, value, false, "global");
  return result;
}

export async function gitIsRepo(path: string) {
  if (!existsSync(path)) {
    return false;
  }
  const git = simpleGit(path);
  const result = await git.checkIsRepo();
  return result;
}

export async function gitPull(path: string) {
  const git = simpleGit(path);
  const result = await git.pull();
  return result;
}

export async function gitPush(path: string) {
  const git = simpleGit(path);
  const result = await git.push();
  return result;
}

export async function gitCommit(path: string, message: string) {
  const git = simpleGit(path);
  const result = await git.commit(message, undefined);
  return result;
}

export async function gitClone(path: string, url: string) {
  await exec(`git clone ${url}`, { cwd: path });
}

export async function gitAdd(path: string) {
  const git = simpleGit(path);
  const result = await git.add(".");
  return result;
}

export async function gitSync(path: string) {
  if (await gitIsRepo(path)) {
    await gitAdd(path);
    await gitCommit(path, "Syncronizing");
    try {
      await gitPull(path);
    } catch {}
    await gitPush(path);
  }
}
