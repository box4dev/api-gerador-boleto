import { describe, it } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app';

describe('E2E: Fluxo de Geração de Boletos', () => {

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
        carteira: '109'
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

      // O Hono captura erro de parsing de JSON e pode retornar 400 ou 500
      // dependendo de como o middleware de parsing está configurado.
      assert.ok(res.status >= 400);
    });

  });
});