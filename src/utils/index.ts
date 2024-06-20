/**
 * Get property value by path like 'a.b.c'
 * @param obj
 * @param path
 * @returns
 */
export function getPropertyByPath(obj: Record<string, unknown> | Record<string, unknown>[], path: string): any {
  const keys = path.split('.').filter(Boolean);
  let value: unknown = obj;

  if (!keys.length) return value;

  if (Array.isArray(value)) {
    getArrayValueByIndex(value, keys);
  }

  for (let i = 0; i < keys.length; i++) {
    if (Array.isArray(value)) {
      getArrayValueByIndex(value, keys.slice(i));
      continue;
    }

    value = (value as Record<string, unknown>)[keys[i]];
  }

  return value;
}

function getArrayValueByIndex(arr: any[], keys: string[]) {
  const index = parseInt(keys[0], 10);
  if (isNaN(index)) return getPropertyByPath(arr[0], keys.join('.'));
  else return getPropertyByPath(arr[index], keys.slice(1).join('.'));
}
