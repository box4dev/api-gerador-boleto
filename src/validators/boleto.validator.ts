import { z } from 'zod';

/**
 * Schema for validating the input parameters for boleto generation.
 * All fields are optional, mirroring the @box4dev/gerador-boleto package's flexibility.
 */
export const gerarBoletoSchema = z
  .object({
    banco: z.enum(['bradesco', 'caixa', 'itau', 'santander']).optional(),
    dataEmissao: z.string().date().optional(),
    dataVencimento: z.string().date().optional(),
    valorDocumento: z.number().int().positive().optional(),
    nossoNumero: z.string().optional(),
    agencia: z.string().optional(),
    codigoCedente: z.string().optional(),
    carteira: z.string().optional(),
    localPagamento: z.string().optional(),
    numeroDocumento: z.string().optional(),
    cedente: z.string().optional(),
    cedenteCnpj: z.string().optional(),
    instrucoesPagamento: z.string().optional(),
    identificadorEmissao: z.string().optional(),
  })
  .strict();

export type GerarBoletoInput = z.infer<typeof gerarBoletoSchema>;
