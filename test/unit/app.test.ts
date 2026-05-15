import { describe, it } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app';

describe('Unit: Application Configuration', () => {
  it('deve inicializar a instância do Hono corretamente', () => {
    assert.strictEqual(typeof app.fetch, 'function');
  });

  it('deve possuir a rota base /api/boleto registrada', () => {
    const routes = app.routes.map(r => r.path);
    const hasBaseRoute = routes.some(path => path.startsWith('/api/boleto'));
    assert.ok(hasBaseRoute, 'A rota /api/boleto deve estar definida');
  });
});