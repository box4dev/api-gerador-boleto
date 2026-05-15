import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { BoletoService } from '../services/boleto.service';
import { gerarBoletoSchema } from '../validators/boleto.validator';

/**
 * Controller for boleto-related operations.
 * Handles incoming HTTP requests, validates input, and orchestrates the service layer.
 */
export class BoletoController {
  private boletoService: BoletoService;

  constructor() {
    this.boletoService = new BoletoService();
  }

  public generateBoleto = (req: Request, res: Response) => {
    try {
      const validatedParams = gerarBoletoSchema.parse(req.body);
      const boletoData = this.boletoService.generateBoleto(validatedParams);
      return res.status(200).json(boletoData);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error generating boleto:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}
