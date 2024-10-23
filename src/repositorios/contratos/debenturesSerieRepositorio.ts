import { DebentureSerie } from 'src/@types/entities/debenture';
import { AtualizarDebentureSerieDto } from 'src/app/debentures/dto/atualizar-debenture-serie.dto';

export abstract class DebentureSerieRepositorio {
  abstract criar(
    debentureSerie: Omit<DebentureSerie, 'id'>,
    sessao?: unknown,
  ): Promise<DebentureSerie>;

  abstract encontrarPorId(id: number): Promise<DebentureSerie | null>;

  abstract encontrarTodos(
    limite: number,
    deslocamento: number,
  ): Promise<DebentureSerie[]>;

  abstract atualizar(
    id: number,
    debentureSerie: AtualizarDebentureSerieDto,
    sessao?: unknown,
  ): Promise<DebentureSerie | null>;

  abstract deletar(id: number, sessao?: unknown): Promise<void>;

  abstract contarSeries(idDebenture: number): Promise<number>;

  abstract contarSeriesTotal(): Promise<number>;

  abstract encontrarSeriesPorIdDebenture(
    idDebenture: number,
  ): Promise<DebentureSerie[]>;
}
