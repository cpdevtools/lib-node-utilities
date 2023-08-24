import { importChalk } from "./chalk";
import { exec, run } from "./cmd";

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

export async function githubLogin(token: string): Promise<boolean>;
/**
 * @deprecated Use githubLogin(token: string) instead
 */
export async function githubLogin(user: string, token: string): Promise<boolean>;
export async function githubLogin(...args: string[]): Promise<boolean> {
  const chalk = await importChalk();
  if (args.length === 2) {
    console.info(`Attempting to log into github.com with user ${chalk.yellowBright(args[0])}`);
    const result = await exec(`echo "${args[1]}" | gh auth login --with-token`);
    return !result;
  }
  const result = await exec(`GITHUB_TOKEN="${args[0]}"; gh auth login -h github.com`);
  return !result;
}

export interface GithubAuthStatus {
  username: string;
  protocol: string;
  token: string;
  scopes: string[];
}

export async function githubAuthStatus(env?: NodeJS.ProcessEnv): Promise<GithubAuthStatus> {
  const result = await run(`gh auth status -t`, { env });

  const usernameRegExp = /Logged in to github\.com as ([\w\d]+)/i;
  const usernameMatch = result.match(usernameRegExp);
  const username = usernameMatch?.[1];

  const protocolRegExp = /configured to use ([\w]+) protocol/i;
  const protocolMatch = result.match(protocolRegExp);
  const protocol = protocolMatch?.[1];

  const tokenRegExp = /Token: ([\w\d\*]+)/i;
  const tokenMatch = result.match(tokenRegExp);
  const token = tokenMatch?.[1];

  const scopesRegExp = /Token scopes: (.*?)$/im;
  const scopesMatch = result.match(scopesRegExp);
  const scopes = scopesMatch?.[1]?.split(",").map((s) => s.trim());

  return {
    username,
    protocol,
    token,
    scopes,
  } as GithubAuthStatus;
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
