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

export async function gitStatus(path: string) {
  const git = simpleGit(path);
  const result = await git.status();
  return result;
}

export async function gitHasChanges(path: string) {
  const git = simpleGit(path);
  const result = await git.diffSummary();
  return result.files.length > 0;
}

export async function gitTags(path: string) {
  const git = simpleGit(path);
  await git.fetch();
  const result = await git.tags();
  return result;
}

export async function gitRemotes(path: string) {
  const git = simpleGit(path);
  const result = await git.getRemotes(true);
  return result;
}

export async function gitBranches(path: string) {
  const git = simpleGit(path);
  const result = await git.branch();
  return result;
}
