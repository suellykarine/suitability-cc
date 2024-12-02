import {
  ContaInvestidor,
  ContaInvestidorSemVinculos,
} from 'src/@types/entities/contaInvestidor';
import { Repositorio } from './repositorio';

export abstract class ContaInvestidorRepositorio extends Repositorio {
  abstract atualizar(
    identificador: number,
    dados: Partial<Omit<ContaInvestidorSemVinculos, 'id'>>,
  ): Promise<ContaInvestidorSemVinculos | null>;

  abstract criarContaInvestidor(
    dados: Omit<ContaInvestidorSemVinculos, 'id'>,
  ): Promise<ContaInvestidor | null>;

  abstract buscarContaInvestidorPorIdentificadorFundo(
    idenficadorFundo: number,
  ): Promise<ContaInvestidor | null>;
}
