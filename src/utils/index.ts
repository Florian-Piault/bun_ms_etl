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

export async function httpGet(url: string) {
  return fetch(url)
    .then((res) => res.json())
    .catch(() => {
      console.error('Error fetching data');
      return null;
    });
}
