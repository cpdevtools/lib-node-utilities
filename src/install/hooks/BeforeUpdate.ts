export interface BeforeUpdate {
  beforeUpdate(): boolean | void | Promise<boolean | void>;
}

export function implementsBeforeUpdate(obj: any): obj is BeforeUpdate {
  return typeof obj?.beforeUpdate === "function";
}
