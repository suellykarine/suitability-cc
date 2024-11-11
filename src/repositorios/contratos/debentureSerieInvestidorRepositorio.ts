import {
  AtualizaDebentureSerieInvestidorCreditSec,
  AtualizarDebentureSerieInvestidorLaqus,
  DebentureSerieInvestidor,
} from 'src/@types/entities/debenture';
import { RetornoMultiplos } from 'src/utils/prisma/types';
import { Repositorio } from './repositorio';

export type AtualizarProps = Omit<
  Partial<DebentureSerieInvestidor> & { id: number },
  'fundo_investimento' | 'debenture_serie' | 'conta_investidor'
>;

export type EncontrarPorDesvinculoProps = {
  idDebenture: number;
  valorMinimoSerie?: number;
};

export abstract class DebentureSerieInvestidorRepositorio extends Repositorio {
  abstract encontrarPorId(id: number): Promise<DebentureSerieInvestidor | null>;
  abstract encontrarPorDesvinculo(
    props: EncontrarPorDesvinculoProps,
  ): Promise<DebentureSerieInvestidor | null>;
  abstract encontrarPorEncerramento(
    idDebenture: number,
  ): Promise<DebentureSerieInvestidor | null>;
  abstract criar(
    data: Partial<DebentureSerieInvestidor>,
  ): Promise<DebentureSerieInvestidor>;

  abstract encontrarPorIdContaInvestidorDataDesvinculo(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract encontrarPorIdFundoInvestimento(
    props: Pick<DebentureSerieInvestidor, 'id_fundo_investimento'>,
  ): Promise<Omit<DebentureSerieInvestidor, 'debenture_serie'>[] | null>;

  abstract encontrarPorIdContaInvestidorDataEncerramento(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract encontrarPorIdContaInvestidorDataEncerramento(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract atualizar(
    props: AtualizarProps,
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
