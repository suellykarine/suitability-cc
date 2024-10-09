import { Injectable } from '@nestjs/common';
import { FundoInvestimento } from 'src/@types/entities/fundos';

@Injectable()
export abstract class FundoInvestimentoRepositorio {
  abstract encontrarPorId(id: number): Promise<FundoInvestimento | null>;
}
