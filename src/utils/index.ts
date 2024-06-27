/**
 * Get property value by path like 'a.b.c'
 * @param obj
 * @param path
 * @returns
 */
export function getPropertyByPath(obj: any, path: string | undefined): unknown {
  if (!path || path === '') {
    return obj;
  }

  try {
    return path.split('.').reduce((r, a) => r && r[a], obj);
  } catch {
    return null;
  }
}
