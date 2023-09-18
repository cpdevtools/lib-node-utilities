import { readFile, writeFile } from "fs/promises";
import { OpeningAndClosingTags, render } from "mustache";

export function renderTemplate(template: string, data: any, tags: OpeningAndClosingTags = ["{{", "}}"]): string {
  return render(template, data, undefined, {
    tags,
  });
}

export async function renderTemplateFile(templatePath: string, data: any, tags: OpeningAndClosingTags = ["{{", "}}"]): Promise<string> {
  const tpl = await readFile(templatePath, "utf-8");
  return renderTemplate(tpl, data, tags);
}

export async function renderTemplateToFile(
  toFile: string,
  template: string,
  data: any,
  tags: OpeningAndClosingTags = ["{{", "}}"]
): Promise<void> {
  await writeFile(toFile, renderTemplate(template, data, tags), "utf-8");
}

export async function renderTemplateFileToFile(
  toFile: string,
  templatePath: string,
  data: any,
  tags: OpeningAndClosingTags = ["{{", "}}"]
): Promise<void> {
  await writeFile(toFile, await renderTemplateFile(templatePath, data, tags), "utf-8");
}
