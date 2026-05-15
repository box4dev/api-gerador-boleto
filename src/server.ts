import { serve } from '@hono/node-server';
import app from './app';

const PORT = Number(process.env.PORT) || 3000;

/**
 * Starts the Hono API server using the Node.js adapter.
 */
serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server is running on port ${info.port}`);
    console.log(`Access the API at http://localhost:${info.port}/api/boleto/generate`);
  },
);

export default app; // Export app for testing purposes
