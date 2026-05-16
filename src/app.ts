import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import boletoRoutes from './routes/boleto.routes';

/**
 * Initializes and configures the Hono application.
 */
const app = new OpenAPIHono();

// Rotas da API
app.route('/api/boleto', boletoRoutes);

/**
 * Configuração da documentação OpenAPI
 */
const openApiConfig = {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'API Gerador de Boletos',
    description:
      'API para geração de dados de boletos bancários (Linha digitável e Código de Barras)',
  },
};

app.doc('/openapi.json', openApiConfig);

// Endpoint para a interface visual do Swagger
app.get('/swagger', swaggerUI({ url: '/openapi.json' }));

/**
 * Handler Global de Erros
 * Diferencia erros de entrada (Client-side) de erros inesperados (Server-side)
 */
app.onError((err, c) => {
  const isTest = process.env.NODE_ENV === 'test';

  // 1. Identifica JSON malformado (Erro de Sintaxe do Cliente)
  if (err instanceof SyntaxError && err.message.includes('JSON')) {
    if (!isTest) {
      console.warn(`[Client Error] Malformed JSON: ${err.message}`);
    }
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
  if (!isTest) {
    console.error(`[Server Error] ${err.stack || err.message}`);
  }

  return c.json(
    {
      success: false,
      message: 'Ocorreu um erro interno no servidor.',
    },
    500,
  );
});

/**
 * Handler para rotas não encontradas (404)
 * Garante que o retorno seja sempre em formato JSON.
 */
app.notFound((c) => {
  return c.json({ success: false, message: 'Rota não encontrada.' }, 404);
});

export default app;
