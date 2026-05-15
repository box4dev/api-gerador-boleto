import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import boletoRoutes from './routes/boleto.routes';

/**
 * Initializes and configures the Hono application.
 */
const app = new Hono();

// Rotas da API
app.route('/api/boleto', boletoRoutes);

/**
 * Handler Global de Erros
 * Diferencia erros de entrada (Client-side) de erros inesperados (Server-side)
 */
app.onError((err, c) => {
  // 1. Identifica JSON malformado (Erro de Sintaxe do Cliente)
  if (err instanceof SyntaxError && err.message.includes('JSON')) {
    console.warn(`[Client Error] Malformed JSON: ${err.message}`);
    return c.json(
      {
        success: false,
        message: 'O corpo da requisição contém um JSON inválido.',
        error: err.message,
      },
      400,
    ); // Retorna 400 em vez de 500
  }

  // 2. Trata exceções HTTP disparadas propositalmente pelo Hono
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  // 3. Erro Inesperado (Server-side Error)
  console.error(`[Server Error] ${err.stack || err.message}`);

  return c.json(
    {
      success: false,
      message: 'Ocorreu um erro interno no servidor.',
    },
    500,
  );
});

export default app;
