import {
  OperacaoDebentureSemVinculo,
  OperacaoDebenture,
} from 'src/@types/entities/operacaoDebenture';

export abstract class OperacaoDebentureRepositorio {
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
}
