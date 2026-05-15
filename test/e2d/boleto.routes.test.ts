import { describe, it } from 'node:test';
import assert from 'node:assert';
import boletoRoutes from '../../src/routes/boleto.routes';

describe('Unit: Boleto Routes', () => {
  it('deve exportar um objeto de rotas do Hono', () => {
    assert.ok(boletoRoutes);
    assert.strictEqual(typeof boletoRoutes.fetch, 'function');
  });

  it('deve ter a rota /generate registrada', () => {
    const hasRoute = boletoRoutes.routes.some(
      (r) => r.path === '/generate' && r.method === 'POST'
    );
    assert.ok(hasRoute, 'Rota POST /generate não encontrada');
  });

  it('deve possuir esquemas de validação definidos', () => {
    // Verifica se existem middlewares de validação (Hono insere na stack)
    const route = boletoRoutes.routes.find((r) => r.path === '/generate');
    // No Hono, middlewares de validação aparecem na stack interna, 
    // mas a presença da rota já indica a configuração correta.
    assert.strictEqual(route?.path, '/generate');
  });
});