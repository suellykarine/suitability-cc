import {
  AtualizaDebentureSerieInvestidorCreditSec,
  AtualizarDebentureSerieInvestidorLaqus,
  DebentureSerieInvestidor,
} from 'src/@types/entities/debenture';
import { RetornoMultiplos } from 'src/utils/prisma/types';
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

  abstract atualizarStatusLaqus(
    props: AtualizarDebentureSerieInvestidorLaqus,
  ): Promise<RetornoMultiplos>;
  abstract encontrarPorIdDebentureSerie(
    idDebentureSerie: number,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract atualizaDebentureSerieInvestidor(
    data: AtualizaDebentureSerieInvestidorCreditSec,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract todosStatusCreditSecNull(): Promise<
    DebentureSerieInvestidor[] | null
  >;
}
