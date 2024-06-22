/**
 * PostgreSQL data types
 */
type DbType = 'VARCHAR(255)' | 'VARCHAR(MAX)' | 'TEXT' | 'INT' | 'FLOAT' | 'DATE' | 'TIME' | 'TIMESTAMP' | 'BOOLEAN';

/**
 * Human readable data types
 */
type DataType = 'string' | 'char' | 'int' | 'float' | 'boolean' | 'time' | 'datetime' | 'date';

/**
 * Typscript model from a json object
 */

export interface Type {
  name: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  precision: DataType | 'object' | 'array' | Definition[] | Type;
}

export interface Definition {
  key: string;
  type: Type;
}

/**
 * Typescript model from a json object
 *
 * @param table name of the table
 * @param definitions list of columns
 * @param path path to the file ('data.results')
 */
export interface Schema {
  table: string;
  definitions: Definition[];
  path: string;
}

/**
 * DB table schema from a typescript model
 */

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  name: string;
  type: DbType;
  defaultValue?: string;
}

/**
 * Mapper from a typescript model to a DB table schema
 */
export function mapSchemaToTableSchema(schema: Schema | undefined): TableSchema | undefined {
  if (!schema)
    return {
      name: '',
      columns: [],
    };

  const { table, definitions } = schema;

  const columns = definitions
    .map((definition) => {
      const dbType = findDbType(definition.type);

      if (!dbType) return;

      return {
        name: definition.key,
        type: dbType,
      };
    })
    .filter(Boolean) as ColumnSchema[];

  return {
    name: table,
    columns,
  };
}

function findDbType(type: Type): DbType | undefined {
  const mapper: Record<DataType, DbType> = {
    string: 'TEXT',
    char: 'VARCHAR(255)',
    int: 'INT',
    float: 'FLOAT',
    boolean: 'BOOLEAN',
    datetime: 'TIMESTAMP',
    date: 'DATE',
    time: 'TIME',
  };

  if (type.precision === 'object' || type.precision === 'array') {
    return;
  }

  if (typeof type.precision === 'string') {
    return mapper[type.precision];
  }
}
