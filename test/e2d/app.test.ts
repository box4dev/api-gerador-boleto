import assert from 'node:assert';
import { describe, it } from 'node:test';
import { HTTPException } from 'hono/http-exception';
import app from '../../src/app';

// Define o ambiente como teste para silenciar logs no src/app.ts
process.env.NODE_ENV = 'test';

describe('E2E: Fluxo de Geração de Boletos', () => {
  // Injetamos as rotas de erro dinamicamente na instância para cobrir o app.onError
  // sem precisar poluir o código de produção (src/app.ts)
  app.get('/api/test/error-500', () => {
    throw new Error('Simulated Crash');
  });
  
  app.get('/api/test/http-exception', () => {
    throw new HTTPException(418, { message: 'Teapot' });
  });

  app.get('/api/test/syntax-error', () => {
    throw new SyntaxError('Other Syntax Error');
  });

  app.get('/api/test/error-no-stack', () => {
    const err = new Error('No Stack Error');
    err.stack = undefined;
    throw err;
  });

  describe('POST /api/boleto/generate', () => {
    // Cenário Positivo: Geração Randômica (Cobre o if do payload vazio)
    it('deve gerar um boleto com dados aleatórios quando o body está vazio', async () => {
      const res = await app.request('/api/boleto/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.ok(body.linhaDigitavel);
      assert.ok(body.codigoBarras);
    });

    // Cenários Positivos: Testando todos os bancos (Cobre lógicas específicas de cada banco)
    const bancos = ['itau', 'bradesco', 'caixa', 'santander'];
    for (const banco of bancos) {
      it(`deve gerar um boleto válido para o banco ${banco}`, async () => {
        const res = await app.request('/api/boleto/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ banco }),
        });
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.strictEqual(body.banco, banco);
      });
    }

    // Cenário Positivo: Payload completo (Cobre a passagem de parâmetros manuais)
    it('deve gerar boleto com dados fornecidos manualmente', async () => {
      const payload = {
        banco: 'itau',
        valorDocumento: 15050,
        nossoNumero: '12345678',
        agencia: '1234',
        codigoCedente: '12345',
        carteira: '109',
      };

      const res = await app.request('/api/boleto/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      assert.strictEqual(res.status, 200);
      assert.strictEqual(body.banco, 'itau');
    });

    // Cenário Negativo: Erro de Validação Zod (Cobre caminhos de erro de input)
    it('deve retornar 400 para banco não suportado', async () => {
      const res = await app.request('/api/boleto/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banco: 'nubank' }), // nubank não está no enum
      });

      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.ok(body.error, 'Deve retornar objeto de erro do Zod');
    });

    // Cenário Negativo: Global Error Handler (Cobre o app.onError em src/app.ts)
    it('deve acionar o handler de erro global para JSON malformado', async () => {
      const res = await app.request('/api/boleto/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ "invalid": json }',
      });

      assert.strictEqual(res.status, 400);
    });

    // Cobre o handler app.notFound (Linhas 33-34)
    it('deve retornar 404 para rotas inexistentes', async () => {
      const res = await app.request('/api/rota-inexistente', {
        method: 'GET',
      });

      assert.strictEqual(res.status, 404);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.message, 'Rota não encontrada.');
    });

    // Cobre as linhas 24-31 (Configuração OpenAPI)
    it('deve retornar o esquema OpenAPI em /openapi.json', async () => {
      const res = await app.request('/openapi.json');
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.info.title, 'API Gerador de Boletos');
    });

    // Cobre as linhas 33-34 (Swagger UI)
    it('deve carregar a interface visual do Swagger', async () => {
      const res = await app.request('/swagger');
      assert.strictEqual(res.status, 200);
      assert.ok((await res.text()).includes('swagger-ui'), 'Deve conter elementos do Swagger UI');
    });

    // Cobre o branch de HTTPException no app.onError
    it('deve processar HTTPException corretamente através do global handler', async () => {
      const res = await app.request('/api/test/http-exception');
      assert.strictEqual(res.status, 418);
    });

    // Cobre o branch de Erro Genérico 500 no app.onError
    it('deve retornar 500 para erros inesperados do servidor', async () => {
      const res = await app.request('/api/test/error-500');
      assert.strictEqual(res.status, 500);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.ok(body.message.includes('erro interno'));
    });

    // Cobre o ramo (err instanceof SyntaxError && !err.message.includes('JSON'))
    it('deve tratar SyntaxError que não seja relacionado a JSON como erro 500', async () => {
      const res = await app.request('/api/test/syntax-error');
      assert.strictEqual(res.status, 500);
    });

    // Cobre o fallback err.stack || err.message no console.error
    it('deve usar err.message no log quando err.stack estiver ausente', async () => {
      const res = await app.request('/api/test/error-no-stack');
      assert.strictEqual(res.status, 500);
    });
  });
});
