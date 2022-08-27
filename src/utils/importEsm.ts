export async function importEsm<T = unknown>(path: string): Promise<T> {
  return (await import(path)).default;
}
