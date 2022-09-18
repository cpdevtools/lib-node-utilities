import { exit } from "process";
import { exec } from "./cmd";
import { dynamicImport } from "tsimportlib";
import type inquirer from "inquirer";
type Inquirer = typeof inquirer;

async function reboot(): Promise<never> {
  await exec(`shutdown.exe -r -t 0`);
  exit(0);
}

export async function rebootWindows(): Promise<never>;
export async function rebootWindows(prompt: false): Promise<never>;
export async function rebootWindows(prompt: true): Promise<never | void>;
export async function rebootWindows(prompt: boolean = false): Promise<void | never> {
  if (!prompt) {
    await reboot();
  }
  const inquirer = (await dynamicImport("inquirer", module)).default as Inquirer;
  const answer = await inquirer.prompt({
    type: "confirm",
    name: "rebootNow",
    message: "Reboot Now?",
  });

  if (answer.rebootNow) {
    await reboot();
  }
}
