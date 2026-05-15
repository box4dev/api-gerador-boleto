import { describe, it } from 'node:test';
import assert from 'node:assert';
// Importamos o schema diretamente para testar a lógica de validação sem HTTP
import { gerarBoletoSchema } from '../../src/validators/boleto.validator';

describe('Unit: Boleto Validator', () => {
  it('deve aceitar um payload válido e completo', () => {
    const validData = {
      banco: 'itau',
      dataEmissao: '2026-05-14',
      dataVencimento: new Date(),
      valorDocumento: 15000, // centavos
      nossoNumero: '12345678',
      agencia: '1234',
      codigoCedente: '12345',
      carteira: '109'
    };

    const result = gerarBoletoSchema.safeParse(validData);
    assert.strictEqual(result.success, true);
  });

  it('deve aceitar tipos invertidos para as datas para cobrir todos os ramos lógicos', () => {
    const validData = {
      // Invertendo o que foi feito no teste anterior para forçar o motor a passar
      // por todas as partes da condição OR (||) em ambos os campos.
      dataEmissao: new Date(),   // dataEmissao: Testa o ramo instanceof Date (A=false, B=true)
      dataVencimento: '2026-12-31' // dataVencimento: Testa o ramo typeof string (A=true)
    };

    const result = gerarBoletoSchema.safeParse(validData);
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.ok(result.data.dataEmissao instanceof Date);
      assert.ok(result.data.dataVencimento instanceof Date);
    }
  });

  it('deve aceitar um objeto vazio (geração randômica)', () => {
    const result = gerarBoletoSchema.safeParse({});
    assert.strictEqual(result.success, true);
  });

  it('deve rejeitar bancos não suportados (Cenário Negativo)', () => {
    const invalidData = { banco: 'banco_fantasia' };
    const result = gerarBoletoSchema.safeParse(invalidData);

    assert.strictEqual(result.success, false);
    if (!result.success) {
      const issues = result.error.format();
      assert.ok(issues.banco, 'Deve haver um erro no campo banco');
    }
  });

  it('deve rejeitar valorDocumento se não for número ou string numérica', () => {
    const result = gerarBoletoSchema.safeParse({ valorDocumento: true });
    assert.strictEqual(result.success, false);
  });

  it('deve cobrir o retorno padrão (ramo else) do preprocess para ambos os campos', () => {
    // Passar algo que não é string nem Date para ambos
    // Isso garante que o "return arg" seja executado em todas as instâncias do preprocess
    const result = gerarBoletoSchema.safeParse({
      dataEmissao: 123,
      dataVencimento: true
    });
    assert.strictEqual(result.success, false);
  });
});