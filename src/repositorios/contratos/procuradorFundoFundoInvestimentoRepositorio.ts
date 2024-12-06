import {
  ProcuradorFundoFundoInvestimento,
  ProcuradorFundoFundoInvestimentoSemVinculo,
} from 'src/@types/entities/fundos';
import { Repositorio } from './repositorio';

export abstract class ProcuradorFundoFundoInvestimentoRepositorio extends Repositorio {
  abstract removerPorFundo(idFundo: number): Promise<void>;
  abstract buscarPorProcurador(
    idProcurador: number,
  ): Promise<ProcuradorFundoFundoInvestimento[]>;
  abstract criar(
    data: Omit<ProcuradorFundoFundoInvestimentoSemVinculo, 'id'>,
  ): Promise<ProcuradorFundoFundoInvestimentoSemVinculo>;
}
