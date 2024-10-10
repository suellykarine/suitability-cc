import { ContaInvestidor } from 'src/@types/entities/contaInvestidor';

export abstract class ContaInvestidorRepositorio {
  abstract atualizarContaInvestidorFundoInvestimento(
    idFundoInvestimento: number,
    idContaInvestidor: number,
  ): Promise<ContaInvestidor | null>;
}
