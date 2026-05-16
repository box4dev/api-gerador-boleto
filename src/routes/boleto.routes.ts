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
        'application/json': { schema: gerarBoletoSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: boletoResponseSchema },
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
