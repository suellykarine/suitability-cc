import { Repositorio } from './repositorio';
import { StatusFundoInvestimento } from 'src/@types/entities/fundos';

export abstract class StatusFundoInvestimentoRepositorio extends Repositorio {
  abstract encontrarPorNome(
    nome: string,
  ): Promise<StatusFundoInvestimento | null>;
}
