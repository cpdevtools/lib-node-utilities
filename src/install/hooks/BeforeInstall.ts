export interface BeforeInstall {
  beforeInstall(): boolean | void | Promise<boolean | void>;
}

export function implementsBeforeInstall(obj: any): obj is BeforeInstall {
  return typeof obj?.beforeInstall === "function";
}
