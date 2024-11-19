import { Prisma, operacao_debenture } from '@prisma/client';
import { CriarOperacaoDebenture } from 'src/@types/entities/operacaoDebenture';

export abstract class OperacaoDebentureRepositorio {
  abstract criar(data: CriarOperacaoDebenture): Promise<operacao_debenture>;

  abstract atualizar(
    data: Partial<CriarOperacaoDebenture>,
    id: number,
  ): Promise<operacao_debenture>;

  abstract buscarOperacoesPeloStatusCreditSec(
    statusCreditSec: string,
  ): Promise<operacao_debenture[]>;

  abstract buscarOperacoesPeloCodigoOperacao(
    cofigoOperacao: string,
  ): Promise<operacao_debenture[]>;
}
