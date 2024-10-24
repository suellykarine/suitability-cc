import { DebentureSerieInvestidor } from 'src/@types/entities/debenture';
import { Repositorio } from './repositorio';

export abstract class DebentureSerieInvestidorRepositorio extends Repositorio {
  abstract encontrarPorId(id: number): Promise<DebentureSerieInvestidor | null>;
  abstract encontrarPorDesvinculo(): Promise<DebentureSerieInvestidor | null>;
  abstract encontrarPorEncerramento(): Promise<DebentureSerieInvestidor | null>;
  abstract criar(
    data: Partial<DebentureSerieInvestidor>,
  ): Promise<DebentureSerieInvestidor>;

  abstract encontrarPorIdContaInvestidorDataDesvinculo(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract encontrarPorIdContaInvestidorDataEncerramento(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract encontrarPorIdContaInvestidorDataEncerramento(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract encontrarPorIdDebentureSerie(
    idDebentureSerie: number,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract atualizaDebentureSerieInvestidor(
    idDebentureSerieInvestidor: number,
    status: string,
    motivo: string | null,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract todosStatusCreditSecNull(): Promise<
    DebentureSerieInvestidor[] | null
  >;
}
