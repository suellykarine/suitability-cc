import {
  OperacaoDebentureSemVinculo,
  OperacaoDebenture,
} from 'src/@types/entities/operacaoDebenture';
import { Repositorio } from './repositorio';

export abstract class OperacaoDebentureRepositorio extends Repositorio {
  abstract criar(
    data: Omit<OperacaoDebentureSemVinculo, 'id'>,
  ): Promise<OperacaoDebenture>;

  abstract atualizar(
    id: number,
    data: Partial<Omit<OperacaoDebentureSemVinculo, 'id'>>,
  ): Promise<OperacaoDebenture>;

  abstract buscarOperacoesPeloStatusCreditSec(
    statusCreditSec: string,
  ): Promise<OperacaoDebenture[]>;

  abstract buscarOperacaoPeloCodigoOperacao(
    cofigoOperacao: string,
  ): Promise<OperacaoDebenture>;

  abstract buscarPorGestorFundo(id: number): Promise<OperacaoDebenture[]>;

  abstract buscarTodasOperacoes(): Promise<OperacaoDebenture[]>;
}
