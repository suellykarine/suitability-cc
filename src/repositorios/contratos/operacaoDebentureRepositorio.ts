import { OperacaoDebenture } from 'src/@types/entities/operacaoDEbenture';

export abstract class OperacaoDebentureRepositorio {
  abstract buscarPorFundoInvestimento(id: number): Promise<OperacaoDebenture[]>;
}
