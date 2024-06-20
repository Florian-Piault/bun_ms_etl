/**
 * Possible types
 *
 * SubTypes
 *
 * string -> 'string' | 'char'
 *
 * number -> 'int' | 'float'
 *
 * boolean -> /
 *
 * date -> 'date' | 'time' | 'datetime'
 *
 * object -> Type
 */
export interface Type {
  name: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  subType?: 'char' | 'int' | 'float' | 'time' | 'datetime' | 'object' | 'array' | Schema | Type;
}

export interface Definition {
  key: string;
  type: Type;
}

export type Schema = Definition[];
