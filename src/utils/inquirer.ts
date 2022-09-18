import type inquirer from "inquirer";
import type inquirerSelect from "@inquirer/select";
import { dynamicImport } from "tsimportlib";

export async function importInquirer(): Promise<typeof inquirer> {
  return (await dynamicImport("inquirer", module))?.default;
}

export async function importInquirerSelect(): Promise<typeof inquirerSelect> {
  return (await dynamicImport("@inquirer/select", module))?.default;
}
