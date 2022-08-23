import { PackageJson } from "type-fest";
import { readJsonFile, writeJsonFile } from "../src/utils/json";

(async () => {
  const pkg = (await readJsonFile("./package.json")) as PackageJson;
  delete pkg.devDependencies;
  delete pkg.scripts;
  delete (pkg as any)["lint-staged"];

  pkg.exports ??= {};

  const exp: any = pkg.exports;

  exp["."] ??= {};
  exp["."].import = "./mjs/index.js";
  exp["."].require = "./cjs/index.js";

  await writeJsonFile("./dist/package.json", pkg, 2);

  await writeJsonFile("./dist/cjs/package.json", { type: "commonjs" }, 2);
  await writeJsonFile("./dist/mjs/package.json", { type: "module" }, 2);
})();
