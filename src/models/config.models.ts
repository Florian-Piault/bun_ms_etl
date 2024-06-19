interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

interface APIConnection {
  url: string;
  method: string;
  headers: Record<string, string>;
  params?: Record<string, string>;
}

interface ColumnConfig {
  target: string;
  source?: string;
  dbType: string;
  customQuery?: string;
  defaultValue?: string;
  isNullable?: boolean;
}

interface SourceConfig {
  type: 'api' | 'database';
  connection: APIConnection | DatabaseConnection;
  scripts: string[];
}

interface TargetConfig {
  table: string;
  resultsPath: string;
  columns: ColumnConfig[];
}

interface IETLConfig {
  source: SourceConfig;
  target: TargetConfig;

  getData: () => Promise<Record<string, unknown>[]>;
}

class API_ETLConfig implements IETLConfig {
  source: SourceConfig;
  target: TargetConfig;

  constructor({ source, target }: IETLConfig) {
    this.source = source;
    this.target = target;
  }

  async getData() {
    const connection = this.source.connection as APIConnection;

    const url = new URL(connection.url);
    const { params, method, headers } = connection;

    if (params) {
      Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
    }

    const response = await fetch(url, { method, headers });

    return response.json();
  }
}

class Database_ETLConfig implements IETLConfig {
  source: SourceConfig;
  target: TargetConfig;

  constructor({ source, target }: IETLConfig) {
    this.source = source;
    this.target = target;
  }

  async getData() {
    return [];
  }
}

/**
 * Parse the ETL configuration from a JSON string
 * @param data
 * @returns
 */
export function parseConfig(data: string): IETLConfig {
  const config = JSON.parse(data) as IETLConfig;

  if (config.source.type === 'api') {
    return new API_ETLConfig(config);
  }

  if (config.source.type === 'database') {
    return new Database_ETLConfig(config);
  }

  throw new Error('Invalid ETL configuration');
}
