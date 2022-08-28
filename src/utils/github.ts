import chalk from "chalk";
import { exec } from "./cmd.js";

export async function githubLogin(user: string, token: string) {
  console.info(`Attempting to log into github.com with user ${chalk.yellowBright(user)}`);
  const result = await exec(`echo "${token}" | gh auth login --with-token`);
  return !result;
}

export async function configureGithubCli() {
  console.info(`Configuring Github Cli`);
  await exec(`gh config set git_protocol https -h github.com`);
  await exec(`gh auth setup-git`);
}
export async function clone(id: string, path?: string, cwd?: string) {
  await exec(`gh repo clone ${id} ${path ?? ""}`, { cwd });
}
/*
export async function searchRepos() {
  const a = new Octokit({auth: process.env.GITHUB_TOKEN});

  return await a.repos.listForAuthenticatedUser({type: 'all', });
}
*/
