import { httpGet } from '../utils';
import { getSchema } from './schema';

export const getData = async (uri: string, type: string) => {
  if (type === 'api') return getAPIData(uri);
};

export const getAPIData = async (uri: string) => {
  const rawData = await httpGet(uri);

  const schema = getSchema(rawData, '');

  return { data: rawData, schema };
};
