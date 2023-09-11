import { readFile, writeFile } from "fs/promises";
import { render } from "mustache";
import { PackageManager } from "../package-managers/PackageManager";

export function renderTemplate(template: string, data: any): string {
  return render(template, data, undefined);
}

export async function renderTemplateFile(templatePath: string, data: any): Promise<string> {
  const tpl = await readFile(templatePath, "utf-8");
  return renderTemplate(tpl, data);
}

export async function renderTemplateToFile(toFile: string, template: string, data: any): Promise<void> {
  await writeFile(toFile, renderTemplate(template, data), "utf-8");
}

export async function renderTemplateFileToFile(toFile: string, templatePath: string, data: any): Promise<void> {
  await writeFile(toFile, await renderTemplateFile(templatePath, data), "utf-8");
}
