import glob from "fast-glob";
import { parse } from "path";
import { PackageManager } from "../package-managers";
import { renderTemplateFileToFile } from "./render";

export async function renderGithubWorkflowTemplates() {
  console.log("Rendering GitHub workflow templates...");
  const pm = await PackageManager.loadPackage("package.json");
  const pkgs = await pm.listWorkspacePackages();
  console.log(pkgs);

  const tplFiles = await glob("*.*.mustache", { onlyFiles: true, dot: true, cwd: "./.github/workflow-templates" });
  tplFiles.forEach(async (tplFile) => {
    await renderTemplateFileToFile(`./.github/workflows/${parse(tplFile).name}`, `./.github/workflow-templates/${tplFile}`, {
      projects: pkgs,
    });
  });
}
