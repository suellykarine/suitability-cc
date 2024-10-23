import { ContaInvestidor } from 'src/@types/entities/contaInvestidor';

export abstract class ContaInvestidorRepositorio {
  abstract atualizarContaInvestidorFundoInvestimento(
    idFundoInvestimento: number,
    idContaInvestidor: number,
    sessao?: unknown,
  ): Promise<ContaInvestidor | null>;

  abstract criarContaInvestidor(
    dados: Omit<ContaInvestidor, 'id'>,
    sessao?: unknown,
  ): Promise<ContaInvestidor | null>;
}
