import {
  OperacaoDebentureSemVinculo,
  OperacaoDebenture,
} from 'src/@types/entities/operacaoDebenture';

export abstract class OperacaoDebentureRepositorio {
  abstract criar(
    data: Omit<OperacaoDebentureSemVinculo, 'id'>,
  ): Promise<OperacaoDebenture>;

  abstract atualizar(
    data: Partial<Omit<OperacaoDebentureSemVinculo, 'id'>>,
    id: number,
  ): Promise<OperacaoDebenture>;

  abstract buscarOperacoesPeloStatusCreditSec(
    statusCreditSec: string,
  ): Promise<OperacaoDebenture[]>;

  abstract buscarOperacoesPeloCodigoOperacao(
    cofigoOperacao: string,
  ): Promise<OperacaoDebenture[]>;

  abstract buscarPorGestorFundo(id: number): Promise<OperacaoDebenture[]>;
}
