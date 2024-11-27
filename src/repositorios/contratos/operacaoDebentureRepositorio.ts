import { OperacaoDebenture } from 'src/@types/entities/operacaoDebenture';

export abstract class OperacaoDebentureRepositorio {
  abstract buscarPorFundoInvestimento(id: number): Promise<OperacaoDebenture[]>;
}
