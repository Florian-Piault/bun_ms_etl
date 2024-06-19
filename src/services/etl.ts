import { parseConfig } from '../models/config.models';

const ETL_FOLDER = 'data/etl';

export async function getConfig(pipelineId: string) {
  try {
    const data = await Bun.file(`${ETL_FOLDER}/${pipelineId}.json`).text();
    return parseConfig(data);
  } catch {
    throw new Error('Pipeline not found');
  }
}

export async function getData(pipelineId: string) {
  const config = await getConfig(pipelineId);
  return config.getData();
}
