import { StatusCode } from 'hono/utils/http-status';

interface __BaseReponse {
  [key: string]: unknown;
  status: StatusCode;
}

interface __Ok<T> extends __BaseReponse {
  data: T;
}

interface __Fail extends __BaseReponse {
  error: string;
}

export class Ok<T> implements __Ok<T> {
  status: StatusCode = 200;
  [key: string]: unknown;

  constructor(public data: T, ...args: Record<string, unknown>[]) {
    this.data = data;

    for (const arg of args) {
      const key = Object.keys(arg)[0];
      const value = Object.values(arg)[0];
      this[key] = value;
    }
  }
}

export class Fail implements __Fail {
  status: StatusCode = 500;
  [key: string]: unknown;

  constructor(public error: string, ...args: Record<string, unknown>[]) {
    this.error = error;

    for (const arg of args) {
      const key = Object.keys(arg)[0];
      const value = Object.values(arg)[0];
      this[key] = value;
    }
  }
}
