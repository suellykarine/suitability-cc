import {
  AtualizaDebentureSerieInvestidorCreditSec,
  DebentureSerie,
  DebentureSerieInvestidor,
} from 'src/@types/entities/debenture';
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
  abstract encontrarPorEncerramento(): Promise<DebentureSerieInvestidor | null>;
  abstract criar(
    data: Partial<DebentureSerieInvestidor>,
  ): Promise<DebentureSerieInvestidor>;

  abstract encontrarPorIdContaInvestidorDataDesvinculo(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract encontrarPorIdFundoInvestimento(
    props: Pick<DebentureSerieInvestidor, 'id_fundo_investimento'>,
  ): Promise<DebentureSerieInvestidor[] | null>;

  abstract encontrarMaisRecentePorIdFundoInvestimento(
    props: Pick<DebentureSerieInvestidor, 'id_fundo_investimento'>,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract encontrarPorIdContaInvestidorDataEncerramento(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract encontrarPorIdContaInvestidorDataEncerramento(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract atualizar(
    props: AtualizarProps,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract encontrarMaisRecentePorIdDebentureSerie(
    idDebentureSerie: number,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract atualizaDebentureSerieInvestidor(
    data: AtualizaDebentureSerieInvestidorCreditSec,
  ): Promise<DebentureSerieInvestidor | null>;

  abstract buscarDSIPendenteCreditSec(
    idDebenture: number,
  ): Promise<DebentureSerieInvestidor[] | null>;
  abstract buscarTodasSeriesAptasParaInvestir({
    idFundoInvestimento,
    idDebenture,
  }: {
    idFundoInvestimento: number;
    idDebenture: number;
  }): Promise<DebentureSerie[]>;
}
