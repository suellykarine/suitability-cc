import { ContaInvestidor } from 'src/@types/entities/contaInvestidor';
import { Repositorio } from './repositorio';

export abstract class ContaInvestidorRepositorio extends Repositorio {
  abstract atualizarContaInvestidorFundoInvestimento(
    idFundoInvestimento: number,
    idContaInvestidor: number,
  ): Promise<ContaInvestidor | null>;

  abstract criarContaInvestidor(
    dados: Omit<ContaInvestidor, 'id'>,
  ): Promise<ContaInvestidor | null>;

  abstract buscarContaInvestidorPorIdentificadorFundo(
    idenficadorFundo: number,
  ): Promise<ContaInvestidor | null>;

  abstract buscarContaPorId(
    idContaInvestidor: number,
  ): Promise<ContaInvestidor | null>;
}
