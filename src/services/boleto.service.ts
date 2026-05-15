import { gerarBoleto } from '@box4dev/gerador-boleto';
import type { GerarBoletoInput } from '../validators/boleto.validator';

/**
 * Service layer for boleto generation.
 * This abstracts the external package call and can be easily swapped or extended.
 */
export class BoletoService {
  public generateBoleto(params: GerarBoletoInput) {
    return gerarBoleto(params);
  }
}
