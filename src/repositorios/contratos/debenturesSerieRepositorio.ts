import { Prisma, debenture_serie } from '@prisma/client';

export abstract class DebentureSerieRepositorio {
  abstract criar(
    debentureSerie: Prisma.debenture_serieCreateInput,
  ): Promise<debenture_serie>;

  abstract encontrarPorId(id: number): Promise<debenture_serie | null>;

  abstract encontrarTodos(
    limite: number,
    deslocamento: number,
  ): Promise<debenture_serie[]>;

  abstract atualizar(
    id: number,
    debentureSerie: Prisma.debenture_serieUpdateInput,
  ): Promise<debenture_serie | null>;

  abstract deletar(id: number): Promise<void>;

  abstract contarSeries(idDebenture: number): Promise<number>;

  abstract contarSeriesTotal(): Promise<number>;

  abstract encontrarSeriesPorIdDebenture(
    idDebenture: number,
  ): Promise<debenture_serie[]>;
}
