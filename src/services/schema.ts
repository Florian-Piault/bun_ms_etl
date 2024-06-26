import { Definition, Schema, Type } from '../models/schema.models';

export function getSchema(data: unknown[] | Record<string, unknown>, path: string): Schema | undefined {
  const definitions = getSchemaDefinitions(data);

  return {
    table: path ? path.split('.').at(-1) || '' : '',
    definitions,
    path,
  };
}

function getSchemaDefinitions(data: unknown): Definition[] {
  if (!data) {
    return [];
  }

  if (data !== Object(data)) {
    return getOnlyPropertySchema(data);
  }

  if (Array.isArray(data)) {
    return getArraySchema(data);
  }

  if (Object.keys(data).length === 0) {
    return [];
  }

  return getObjectSchema(data as Record<string, unknown>);
}

/**
 * Get property schema if it's a single property (string, number, boolean, ...)
 * @param data
 * @param path
 * @returns
 */
function getOnlyPropertySchema(data: unknown): Definition[] {
  return [
    {
      key: data as string,
      type: getType(data as string),
    },
  ];
}

function getArraySchema(data: unknown[]): Definition[] {
  if (data.length === 0) return [];

  const firstItem = data[0];

  if (Array.isArray(firstItem)) {
    return getArraySchema(firstItem);
  }

  // case of a single property
  if (firstItem !== Object(firstItem)) {
    return [{ key: 'N/A', type: getType(firstItem as string) }];
  }

  return getObjectSchema(firstItem as Record<string, unknown>);
}

function getObjectSchema(data: Record<string, unknown>): Definition[] {
  const definitions: Definition[] = [];

  for (const key in data) {
    const value = data[key];

    if (Array.isArray(value)) {
      const subSchema = getArraySchema(value);
      definitions.push({ key, type: { name: 'array', precision: subSchema } });
      continue;
    }

    if (value !== Object(value)) {
      definitions.push({ key, type: getType(value as string) });
      continue;
    }

    definitions.push({
      key,
      type: { name: 'object', precision: getObjectSchema(value as Record<string, unknown>) },
    });
  }

  return definitions;
}

function getType(value: string): Type {
  if (isTemporal(value)) {
    if (isTime(value)) return { name: 'date', precision: 'time' };
    if (isDate(value)) return { name: 'date', precision: 'date' };
    if (isDatetime(value)) return { name: 'date', precision: 'datetime' };
  }

  if (isBoolean(value)) return { name: 'boolean', precision: 'boolean' };

  if (isNumber(value)) {
    return isDecimal(value) ? { name: 'number', precision: 'float' } : { name: 'number', precision: 'int' };
  }

  return { name: 'string', precision: 'string' };
}

function isNumber(value: string): boolean {
  return /^-?\d+(?:[.,]\d+)?$/gm.test(value);
}

function isDecimal(value: string): boolean {
  return /\.|,/.test(value);
}

function isTemporal(value: string): boolean {
  return isTime(value) || isDate(value) || isDatetime(value);
}

function isTime(value: string): boolean {
  return /^\d{2}:\d{2}:\d{2}$/.test(value) || /^\d{2}:\d{2}$/.test(value);
}

function isDate(value: string): boolean {
  const yyyy_mm_dd = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const dd_mm_yyyy = /^\d{2}-\d{2}-\d{4}$/.test(value);
  return yyyy_mm_dd || dd_mm_yyyy;
}

function isDatetime(value: string): boolean {
  const yyyy_mm_dd_T_hh_mm_ss_zz = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{6}Z/.test(value);
  const yyyy_mm_dd_T_hh_mm_ss = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value);
  const dd_mm_yyyy_T_hh_mm_ss = /^\d{2}-\d{2}-\d{4}T\d{2}:\d{2}:\d{2}$/.test(value);
  return yyyy_mm_dd_T_hh_mm_ss || dd_mm_yyyy_T_hh_mm_ss || yyyy_mm_dd_T_hh_mm_ss_zz;
}

function isBoolean(value: string): boolean {
  return /^(true|false|0|1)$/gi.test(value);
}
