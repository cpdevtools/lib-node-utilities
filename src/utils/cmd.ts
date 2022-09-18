import { spawn } from "child_process";

export function exec(cmd: string, { cwd }: { cwd?: string } = {}): Promise<number> {
  return new Promise((res, rej) => {
    try {
      const child = spawn(cmd, { shell: true, stdio: "inherit", cwd, env: process.env });
      child.on("exit", (code) => {
        res(code ?? 0);
      });
    } catch (e) {
      rej(e);
    }
  });
}

export function run(cmd: string, { cwd }: { cwd?: string } = {}): Promise<string> {
  return new Promise((res, rej) => {
    try {
      let data: string[] = [];

      const child = spawn(cmd, { shell: true, stdio: "pipe", cwd, env: process.env });
      child.on("exit", (code) => {
        let d = data.join("");

        if (code === 0) {
          res(d);
        } else {
          rej({
            code,
            data: d,
          });
        }
      });

      child.on("error", (e) => {
        rej(e);
      });

      child.stdout?.on("data", (d: Buffer) => {
        const str = Buffer.from(d.filter((b) => !!b)).toString("ascii");
        data.push(str);
      });
    } catch (e) {
      rej(e);
    }
  });
}
