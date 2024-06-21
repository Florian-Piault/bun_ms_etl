import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import * as ETLService from './services/etl';
import * as SchemaService from './services/schema';
import { Fail, Ok } from './models/return.models';

const ADMIN_TENANT_ID = 'admin123';

const app = new Hono();
setupPlugins(app);
setupRoutes(app);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};

function setupRoutes(app: Hono) {
  /**
   * Debug routes
   */
  app.options('*', (c) => c.json({ status: 'alive' }, 204));
  app.get('/healthcheck', (c) => c.json({ status: 'alive' }));
  app.notFound((c) => c.json({ error: 'Not found' }, 404));

  /**
   * ETL ROUTES
   */
  app.get('/etl/config', async (c) => {
    const tenantId = c.req.header('tenant') as string;
    const pipelineId = c.req.query('pipelineId') as string;

    try {
      const configuration = await ETLService.getConfig(pipelineId);
      const { status, ...data } = new Ok(configuration);
      return c.json(data, status);
    } catch (e: any) {
      const { status, ...data } = new Fail(e.message, { pipelineId });
      return c.json(data, status);
    }
  });

  app.get('/etl/data', async (c) => {
    const tenantId = c.req.header('tenant') as string;
    const pipelineId = c.req.query('pipelineId') as string;

    try {
      const data = await ETLService.getData(pipelineId);
      const { status, ...response } = new Ok(data);
      return c.json(response, status);
    } catch (e: any) {
      const { status, ...response } = new Fail(e.message, { pipelineId });
      return c.json(response, status);
    }
  });

  /**
   * Get type schema of json
   */
  app.post('/schema', async (c) => {
    let data: any;
    let path: string | undefined;

    try {
      data = await c.req.json();
      path = c.req.query('path');
    } catch (e: any) {
      return c.json({ error: 'Missing request body' }, 400);
    }

    const schema = SchemaService.getSchema(data, path);
    return c.json(schema, 200);
  });
}

function setupPlugins(app: Hono) {
  app.use(prettyJSON());
  app.use(
    '*',
    cors({
      origin: 'http://localhost:5173',
      allowHeaders: ['*'],
      allowMethods: ['*'],
      exposeHeaders: ['Content-Length'],
    })
  );
  app.use('/etl/*', async (c, next) => {
    const tenantId = c.req.header('tenant');
    if (!tenantId || tenantId !== ADMIN_TENANT_ID) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const pipelineId = c.req.query('pipelineId');
    if (!pipelineId) {
      return c.json({ error: 'Missing pipelineId' }, 400);
    }
    await next();
  });

  app.use('/schema', async (c, next) => {
    const tenantId = c.req.header('tenant');
    if (!tenantId || tenantId !== ADMIN_TENANT_ID) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await next();
  });
}
