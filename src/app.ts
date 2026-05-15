import { Hono } from 'hono';
import boletoRoutes from './routes/boleto.routes';

/**
 * Initializes and configures the Hono application.
 */
const app = new Hono();

// Rotas da API
app.route('/api/boleto', boletoRoutes);

// Tratamento global de erros (opcional, Hono já trata bem JSON inválido)
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ message: 'Internal server error' }, 500);
});

export default app;
