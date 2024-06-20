import { Schema, Type } from '../models/schema.models';
import { getPropertyByPath } from '../utils';

export function getSchema(data: unknown[] | Record<string, unknown>): Schema {
  if (!data) return [];

  if (Array.isArray(data)) return getArraySchema(data);
  return getRecordSchema(data);
}

function getArraySchema(data: unknown[]): Schema {
  if (data.length === 0) return [];

  const first = data[0];

  if (Array.isArray(first)) {
    const subSchema = getArraySchema(first);
    return [{ key: '', type: { name: 'array', subType: subSchema } }];
  }

  if (typeof first === 'object') {
    const subSchema = getSchema(first as Record<string, unknown>);
    return [{ key: '', type: { name: 'object', subType: subSchema } }];
  }

  const type = getType(first as string);
  return [{ key: '', type }];
}

function getRecordSchema(data: Record<string, unknown>): Schema {
  const schema: Schema = [];

  for (const key in data) {
    const value = data[key];

    if (Array.isArray(value)) {
      const subSchema = getArraySchema(value);
      schema.push({ key, type: { name: 'array', subType: subSchema } });
    }

    if (typeof value === 'object') {
      const subSchema = getSchema(value as Record<string, unknown>);
      schema.push({ key, type: { name: 'object', subType: subSchema } });
    } else {
      const type = getType(value as string);
      schema.push({ key, type });
    }
  }

  return schema;
}

function getType(value: string): Type {
  if (isTemporal(value)) {
    if (isTime(value)) return { name: 'date', subType: 'time' };
    if (isDate(value)) return { name: 'date' };
    if (isDatetime(value)) return { name: 'date', subType: 'datetime' };
  }

  if (isBoolean(value)) return { name: 'boolean' };

  if (isNumber(value)) {
    return isDecimal(value) ? { name: 'number', subType: 'float' } : { name: 'number', subType: 'int' };
  }

  return { name: 'string' };
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
  const yyyy_mm_dd_T_hh_mm_ss = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value);
  const dd_mm_yyyy_T_hh_mm_ss = /^\d{2}-\d{2}-\d{4}T\d{2}:\d{2}:\d{2}$/.test(value);
  return yyyy_mm_dd_T_hh_mm_ss || dd_mm_yyyy_T_hh_mm_ss;
}

function isBoolean(value: string): boolean {
  return /^(true|false|0|1)$/gi.test(value);
}
