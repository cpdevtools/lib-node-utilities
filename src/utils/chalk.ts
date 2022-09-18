import type chalk from "chalk";

import { dynamicImport } from "tsimportlib";

export async function importChalk(): Promise<typeof chalk> {
  return (await dynamicImport("chalk", module))?.default;
}
