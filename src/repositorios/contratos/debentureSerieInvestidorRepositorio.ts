import { DebentureSerieInvestidor } from 'src/@types/entities/debenture';
import { RetornoMultiplos } from 'src/utils/prisma/types';
import { Repositorio } from './repositorio';

export type AtualizarStatusRetornoLaqus = {
  status: StatusRetornoLaqus;
  justificativa: string;
  idFundoInvestimento: number;
};
export type StatusRetornoLaqus = 'Pendente' | 'Reprovado' | 'Aprovado';
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
    props: AtualizarStatusRetornoLaqus,
  ): Promise<RetornoMultiplos>;
}
