import { Injectable } from '@nestjs/common';
import { fundo_investimento } from '@prisma/client';

@Injectable()
export abstract class FundoInvestimentoRepositorio {
  abstract encontrarPorId(id: number): Promise<fundo_investimento | null>;
}
