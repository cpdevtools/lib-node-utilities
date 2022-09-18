import { importChalk } from "./chalk";
import { exec } from "./cmd";

export interface GithubRepoOptions {
  cwd?: string;
}

export interface GithubRepoCreateOptions extends GithubRepoOptions {
  /**
   * Clone the new repository to the current directory
   */
  clone?: boolean;
  /**
   * Description of the repository
   */
  description?: string;
  /**
   * Disable issues in the new repository
   */
  disableIssues?: boolean;
  /**
   * Disable wiki in the new repository
   */
  disableWiki?: boolean;
  /**
   * Specify a gitignore template for the repository
   */
  gitIgnore?: string;
  /**
   * Repository home page URL
   */
  homepage?: string;
  /**
   * Include all branches from template repository
   */
  includeAllBranches?: boolean;
  /**
   * Make the new repository internal
   */
  internal?: boolean;

  /**
   * Specify an Open Source License for the repository
   */
  license?: string;
  /**
   * Make the new repository private
   */
  private?: boolean;
  /**
   * Make the new repository public
   */
  public?: boolean;
  /**
   * Push local commits to the new repository
   */
  push?: boolean;
  /**
   * Specify remote name for the new repository
   */
  remote?: string;
  /**
   * Specify path to local repository to use as source
   */
  source?: string;
  /**
   * The name of the organization team to be granted access
   */
  team?: string;
  /**
   * Make the new repository based on a template repository
   */
  template?: boolean;
}

export async function githubLogin(user: string, token: string) {
  const chalk = await importChalk();
  console.info(`Attempting to log into github.com with user ${chalk.yellowBright(user)}`);
  const result = await exec(`echo "${token}" | gh auth login --with-token`);
  return !result;
}

export async function configureGithubCli() {
  console.info(`Configuring Github Cli`);
  await exec(`gh config set git_protocol https -h github.com`);
  await exec(`gh auth setup-git`);
}

export async function cloneRepo(id: string, path?: string, opts?: GithubRepoOptions) {
  await exec(`gh repo clone ${id} ${path ?? ""}`, { cwd: opts?.cwd });
}

export async function createRepo(id: string, opts?: GithubRepoCreateOptions) {
  const cmd = [`gh repo create ${id}`];

  if (opts?.clone) {
    cmd.push(`--clone`);
  }
  if (opts?.description) {
    cmd.push(`--description "${opts?.description}"`);
  }
  if (opts?.disableIssues) {
    cmd.push(`--disable-issues`);
  }
  if (opts?.disableWiki) {
    cmd.push(`--disable-wiki`);
  }
  if (opts?.gitIgnore) {
    cmd.push(`--gitignore "${opts?.gitIgnore}"`);
  }
  if (opts?.homepage) {
    cmd.push(`--homepage "${opts?.homepage}"`);
  }
  if (opts?.includeAllBranches) {
    cmd.push(`--include-all-branches`);
  }
  if (opts?.internal) {
    cmd.push(`--internal`);
  }
  if (opts?.license) {
    cmd.push(`--license "${opts?.license}"`);
  }
  if (opts?.private) {
    cmd.push(`--private`);
  }
  if (opts?.public) {
    cmd.push(`--public`);
  }
  if (opts?.push) {
    cmd.push(`--push`);
  }
  if (opts?.remote) {
    cmd.push(`--remote "${opts?.remote}"`);
  }
  if (opts?.source) {
    cmd.push(`--source "${opts?.source}"`);
  }
  if (opts?.team) {
    cmd.push(`--team "${opts?.team}"`);
  }
  if (opts?.template) {
    cmd.push(`--template "${opts?.template}"`);
  }
  await exec(cmd.join(" "), { cwd: opts?.cwd });
}
/*
export async function searchRepos() {
  const a = new Octokit({auth: process.env.GITHUB_TOKEN});

  return await a.repos.listForAuthenticatedUser({type: 'all', });
}
*/
