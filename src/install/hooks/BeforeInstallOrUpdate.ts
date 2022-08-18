export interface BeforeInstallOrUpdate {
  beforeInstallOrUpdate(): boolean | void | Promise<boolean | void>;
}

export function implementsBeforeInstallOrUpdate(obj: any): obj is BeforeInstallOrUpdate {
  return typeof obj?.beforeInstallOrUpdate === "function";
}
