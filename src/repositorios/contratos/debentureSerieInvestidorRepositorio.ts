import { DebentureSerieInvestidor } from 'src/@types/entities/debenture';

export abstract class DebentureSerieInvestidorRepositorio {
  abstract encontrarPorId(id: number): Promise<DebentureSerieInvestidor | null>;
  abstract encontrarPorDesvinculo(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null>;
  abstract encontrarPorEncerramento(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null>;
  abstract criar(
    data: Partial<DebentureSerieInvestidor>,
  ): Promise<DebentureSerieInvestidor>;
}
