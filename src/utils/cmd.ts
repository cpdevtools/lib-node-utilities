import { Serializable, spawn, SpawnOptions } from "child_process";

import { filter, lastValueFrom, Observable, reduce, share } from "rxjs";

interface ChildProcessEvent {
  type: string;
}
interface ChildProcessCloseEvent extends ChildProcessEvent {
  type: "close";
  code: number;
}
interface ChildProcessMessageEvent extends ChildProcessEvent {
  type: "message";
  message: Serializable;
}
interface ChildProcessDataEvent extends ChildProcessEvent {
  type: "data";
  data: string;
}

export class ChildProcessObservable extends Observable<ChildProcessEvent> {
  private readonly _process$ = new Observable<ChildProcessEvent>((subscriber) => {
    const child = spawn(this.cmd, this.options);
    child.once("error", (err) => {
      subscriber.error(err);
    });
    child.once("close", (code) => {
      subscriber.next({
        type: "close",
        code: code ?? 0,
      } as ChildProcessCloseEvent);
      subscriber.complete();
    });

    child.on("message", (message) => {
      subscriber.next({
        type: "message",
        message,
      } as ChildProcessMessageEvent);
    });

    child.stdout?.on("data", (data: Buffer) => {
      try {
        const str = Buffer.from(data.filter((b) => !!b)).toString("ascii");
        subscriber.next({
          type: "data",
          data: str,
        } as ChildProcessDataEvent);
      } catch (e) {
        console.warn("Failed to parse process std output");
        console.warn(e);
      }
    });

    child.stderr?.on("data", (data: Buffer) => {
      try {
        const str = Buffer.from(data.filter((b) => !!b)).toString("ascii");
        subscriber.next({
          type: "data",
          data: str,
        } as ChildProcessDataEvent);
      } catch (e) {
        console.warn("Failed to parse process std error output");
        console.warn(e);
      }
    });

    return () => {
      child.unref();
    };
  }).pipe(share());

  public constructor(private readonly cmd: string, private readonly options: SpawnOptions) {
    super((subscriber) => {
      const sub = this._process$.subscribe(subscriber);
      return () => {
        sub.unsubscribe();
      };
    });
  }

  public readonly data$ = this._process$.pipe(filter((d) => d.type === "data")) as Observable<ChildProcessDataEvent>;
  public readonly dataComplete$ = this.data$.pipe(
    reduce(
      (a, b) => {
        a.data += b.data;
        return a;
      },
      {
        type: "data",
        data: "",
      } as ChildProcessDataEvent
    )
  );

  public get complete(): Promise<ChildProcessCloseEvent> {
    return lastValueFrom(this._process$) as Promise<ChildProcessCloseEvent>;
  }
}

export async function exec(cmd: string, { cwd }: { cwd?: string } = {}): Promise<number> {
  const child = new ChildProcessObservable(cmd, {
    shell: true,
    stdio: "inherit",
    cwd,
    env: process.env,
  });
  const result = await child.complete;
  return result.code;
}

export async function run(cmd: string, { cwd }: { cwd?: string } = {}): Promise<string> {
  const child = new ChildProcessObservable(cmd, {
    shell: true,
    stdio: "pipe",
    cwd,
    env: process.env,
  });

  const result = await lastValueFrom(child.dataComplete$);
  const comp = await child.complete;
  if (comp.code !== 0) {
    throw {
      code: comp.code,
      data: result.data,
    };
  }
  return result.data;
}

export async function start(cmd: string, { cwd }: { cwd?: string } = {}) {
  const child = spawn(cmd, {
    shell: true,
    detached: true,
    stdio: "ignore",
    cwd,
    env: process.env,
  });
  child.unref();
}
