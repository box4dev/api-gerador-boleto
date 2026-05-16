import { serve } from '@hono/node-server';
import app from './app';

/**
 * Inicia o servidor Node.js apenas se detectado o ambiente Node.
 * Isso permite que o mesmo arquivo funcione no Cloudflare Workers (que usa o export default).
 */
const isNode = typeof process !== 'undefined' && process.release?.name === 'node';

if (isNode) {
  const PORT = Number(process.env.PORT) || 3000;
  serve(
    {
      fetch: app.fetch,
      port: PORT,
    },
    (info) => {
      console.log(`Server is running on Node.js port ${info.port}`);
      console.log(`Access the API at http://localhost:${info.port}/api/boleto/generate`);
    },
  );
}

export default app;
