import {
  DebentureSerie,
  DebentureSerieInvestidor,
  DebentureSerieInvestidorSemVinculo,
} from 'src/@types/entities/debenture';
import { Repositorio } from './repositorio';

export type AtualizarProps = Partial<DebentureSerieInvestidorSemVinculo> & {
  id: number;
};

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
    data: Partial<DebentureSerieInvestidorSemVinculo>,
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
