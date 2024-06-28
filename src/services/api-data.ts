export async function getData(uri: string, path: string = '') {
  const data = await fetch(new URL(uri))
    .then((res) => res.json())
    .catch(() => {
      console.error('Error fetching data');
      return null;
    });

  let _data = data;

  const paths = path.split('.');
  for (const prop of paths) {
    if (_data && _data[prop]) {
      _data = _data[prop];
    }

    while (Array.isArray(_data)) {
      _data = _data[0];
    }
  }
  return Object(_data) === _data ? _data : { [paths.at(-1) as string]: _data };
}
