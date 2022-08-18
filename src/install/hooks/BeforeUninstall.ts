export interface BeforeUninstall {
  beforeUninstall(): boolean | void | Promise<boolean | void>;
}

export function implementsBeforeUninstall(obj: any): obj is BeforeUninstall {
  return typeof obj?.beforeUninstall === "function";
}
