import { ContaInvestidor } from 'src/@types/entities/contaInvestidor';
import { Repositorio } from './repositorio';

export abstract class ContaInvestidorRepositorio extends Repositorio {
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
