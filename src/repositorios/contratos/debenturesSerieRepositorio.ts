import {
  DebentureSerie,
  DebentureSerieSemVinculo,
} from 'src/@types/entities/debenture';
import { Repositorio } from './repositorio';

export abstract class DebentureSerieRepositorio extends Repositorio {
  abstract criar(
    debentureSerie: Omit<DebentureSerie, 'id'>,
  ): Promise<DebentureSerie>;

  abstract encontrarPorId(id: number): Promise<DebentureSerie | null>;

  abstract encontrarSeriePorNumeroEmissaoNumeroSerie(
    numero_emissao: number,
    numero_serie: number,
  ): Promise<DebentureSerie | null>;

  abstract encontrarTodos(
    limite: number,
    deslocamento: number,
  ): Promise<DebentureSerie[]>;

  abstract atualizar(
    id: number,
    data: Partial<Omit<DebentureSerieSemVinculo, 'id'>>,
  ): Promise<DebentureSerie | null>;

  abstract deletar(id: number): Promise<void>;

  abstract contarSeriesTotal(): Promise<number>;

  abstract encontrarSeriesPorIdDebenture(
    idDebenture: number,
  ): Promise<DebentureSerie[]>;

  abstract buscarPorNumeroSerie(
    idDebenture: number,
    numeroSerie: number,
  ): Promise<DebentureSerie | null>;
}
