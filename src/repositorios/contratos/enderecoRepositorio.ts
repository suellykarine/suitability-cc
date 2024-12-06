import { Endereco, EnderecoSemVinculo } from 'src/@types/entities/endereco';
import { Repositorio } from './repositorio';

export abstract class EnderecoRepositorio extends Repositorio {
  abstract atualizar(
    id: number,
    dadosAtualizados: Partial<EnderecoSemVinculo>,
  ): Promise<Endereco | null>;

  abstract buscarPorId(id: number): Promise<Endereco | null>;

  abstract criar(data: Omit<EnderecoSemVinculo, 'id'>): Promise<Endereco>;

  abstract remover(id: number): Promise<void>;
}
