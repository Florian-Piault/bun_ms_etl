import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import * as ETLService from './services/etl';
import * as SchemaService from './services/schema';
import { Fail, Ok } from './models/return.models';

const ADMIN_TENANT_ID = 'admin123';

const app = new Hono();
setupRoutes(app);
setupPlugins(app);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};

function setupRoutes(app: Hono) {
  /**
   * Debug routes
   */
  app.get('/healthcheck', (c) => c.json({ status: 'alive' }));
  app.notFound((c) => c.json({ error: 'Not found' }, 404));

  /**
   * ETL ROUTES
   */
  app.get('/etl/config', async (c) => {
    const tenantId = c.req.header('tenant');
    if (!tenantId || tenantId !== ADMIN_TENANT_ID) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const pipelineId = c.req.query('pipelineId');
    if (!pipelineId) {
      return c.json({ error: 'Missing pipelineId' }, 400);
    }

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
    const tenantId = c.req.header('tenant');
    if (!tenantId || tenantId !== ADMIN_TENANT_ID) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const pipelineId = c.req.query('pipelineId');
    if (!pipelineId) {
      return c.json({ error: 'Missing pipelineId' }, 400);
    }

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
    try {
      data = await c.req.json();
    } catch (e: any) {
      return c.json({ error: 'Missing request body' }, 400);
    }

    const schema = SchemaService.getSchema(data);
    return c.json(schema, 200);
  });
}

function setupPlugins(app: Hono) {
  app.use(prettyJSON());
  // app.use('/etl', async (c, next) => {
  //   console.log('hello before middleware!');
  //   await next();
  //   console.log('hello after middleware!');
  //   // c.res.headers.set('X-App-Name', 'ETL Service');
  // });
}
