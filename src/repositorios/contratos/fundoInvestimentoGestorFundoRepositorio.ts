import { Injectable } from '@nestjs/common';
import { FundoInvestimentoGestorFundo } from 'src/@types/entities/fundos';

@Injectable()
export abstract class FundoInvestimentoGestorFundoRepositorio {
  abstract encontrarPorIdDoFundo(
    id: number,
  ): Promise<FundoInvestimentoGestorFundo | null>;
}
