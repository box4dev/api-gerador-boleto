import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { BoletoService } from '../services/boleto.service';
import { gerarBoletoSchema } from '../validators/boleto.validator';

const router = new Hono();
const boletoService = new BoletoService();

/**
 * Rota para gerar dados de boleto.
 * O zValidator já valida o corpo da requisição contra o schema do Zod
 * e retorna status 400 automaticamente caso os dados sejam inválidos.
 */
router.post('/generate', zValidator('json', gerarBoletoSchema), (c) => {
  // c.req.valid('json') recupera os dados já validados e tipados
  const validatedParams = c.req.valid('json');
  const boletoData = boletoService.generateBoleto(validatedParams);

  return c.json(boletoData);
});

export default router;
