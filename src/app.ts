import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { zodToJsonSchema } from 'zod-to-json-schema';
import boletoRoutes from './routes/boleto.routes';
import { gerarBoletoSchema } from './validators/boleto.validator';

/**
 * Initializes and configures the Hono application.
 */
const app = new OpenAPIHono();

// Rotas da API
app.route('/api/boleto', boletoRoutes);

/**
 * Configuração da documentação OpenAPI com schema manual
 */
const generateOpenApiSpec = () => {
  const requestSchema = zodToJsonSchema(gerarBoletoSchema);

  return {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'API Gerador de Boletos',
      description:
        'API para geração de dados de boletos bancários (Linha digitável e Código de Barras)',
    },
    paths: {
      '/api/boleto/generate': {
        post: {
          summary: 'Gera dados de um boleto',
          description:
            'Cria linha digitável e código de barras baseado nos parâmetros fornecidos ou gera dados aleatórios.',
          requestBody: {
            content: {
              'application/json': {
                schema: requestSchema,
                example: {
                  banco: 'itau',
                  dataEmissao: '2024-01-01',
                  dataVencimento: '2024-02-01',
                  valorDocumento: 10000,
                  nossoNumero: '123456789',
                  agencia: '1234',
                  codigoCedente: '12345',
                  carteira: '175',
                  localPagamento: 'Pagável em qualquer banco até o vencimento',
                  numeroDocumento: '123456',
                  cedente: 'Empresa Exemplo LTDA',
                  cedenteCnpj: '12345678000190',
                  instrucoesPagamento: 'Não receber após o vencimento',
                  identificadorEmissao: '1',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Boleto gerado com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      codigoBarras: { type: 'string' },
                      linhaDigitavel: { type: 'string' },
                      banco: { type: 'string' },
                      codigoBanco: { type: 'string' },
                      dataEmissao: { type: 'string' },
                      dataVencimento: { type: 'string' },
                      valorDocumento: { type: 'number' },
                    },
                    required: [
                      'codigoBarras',
                      'linhaDigitavel',
                      'banco',
                      'codigoBanco',
                      'dataEmissao',
                      'dataVencimento',
                      'valorDocumento',
                    ],
                    example: {
                      codigoBarras: '34191592000000100001000123456789017500000000000',
                      linhaDigitavel: '34191.00012 00000.10001 01234.567890 1 75100000000000',
                      banco: 'itau',
                      codigoBanco: '341',
                      dataEmissao: '2024-01-01',
                      dataVencimento: '2024-02-01',
                      valorDocumento: 10000,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
};

app.get('/openapi.json', (c) => {
  return c.json(generateOpenApiSpec());
});

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
