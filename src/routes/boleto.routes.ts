import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { BoletoService } from '../services/boleto.service';
import { gerarBoletoSchema } from '../validators/boleto.validator';

const router = new OpenAPIHono();
const boletoService = new BoletoService();

/**
 * Schema de exemplo para a resposta na documentação
 */
const boletoResponseSchema = z.object({
  codigoBarras: z.string(),
  linhaDigitavel: z.string(),
  banco: z.string(),
  codigoBanco: z.string(),
  dataEmissao: z.string(),
  dataVencimento: z.string(),
  valorDocumento: z.number(),
});

/**
 * Tipo inferido do schema de resposta para evitar o uso de 'any'
 */
type BoletoResponse = z.infer<typeof boletoResponseSchema>;

const generateRoute = createRoute({
  method: 'post',
  path: '/generate',
  summary: 'Gera dados de um boleto',
  description:
    'Cria linha digitável e código de barras baseado nos parâmetros fornecidos ou gera dados aleatórios.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              banco: { type: 'string', enum: ['bradesco', 'caixa', 'itau', 'santander'] },
              dataEmissao: { type: 'string', format: 'date' },
              dataVencimento: { type: 'string', format: 'date' },
              valorDocumento: { type: 'integer' },
              nossoNumero: { type: 'string' },
              agencia: { type: 'string' },
              codigoCedente: { type: 'string' },
              carteira: { type: 'string' },
              localPagamento: { type: 'string' },
              numeroDocumento: { type: 'string' },
              cedente: { type: 'string' },
              cedenteCnpj: { type: 'string' },
              instrucoesPagamento: { type: 'string' },
              identificadorEmissao: { type: 'string' },
            },
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
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              codigoBarras: { type: 'string' },
              linhaDigitavel: { type: 'string' },
              banco: { type: 'string' },
              codigoBanco: { type: 'string' },
              dataEmissao: { type: 'string', format: 'date' },
              dataVencimento: { type: 'string', format: 'date' },
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
              instrucoesPagamento: 'Não receber após o vencimento'
            },
          },
        },
      },
      description: 'Boleto gerado com sucesso',
    },
  },
});

/**
 * Implementação da rota utilizando o contrato OpenAPI
 */
router.openapi(generateRoute, (c) => {
  const validatedParams = c.req.valid('json');
  const boletoData = boletoService.generateBoleto(validatedParams);
  return c.json(boletoData as BoletoResponse, 200);
});

export default router;
