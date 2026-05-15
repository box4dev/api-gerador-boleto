import { describe, it } from 'node:test';
import assert from 'node:assert';
import boletoRoutes from '../../src/routes/boleto.routes';

describe('Unit: Boleto Routes', () => {
  it('deve exportar um objeto de rotas válido', () => {
    assert.ok(boletoRoutes);
    // Verifica se é uma instância do Hono (sub-roteador)
    assert.strictEqual(typeof boletoRoutes.post, 'function');
  });
});