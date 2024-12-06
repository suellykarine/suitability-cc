import { Repositorio } from './repositorio';
import {
  RepresentanteFundo,
  RepresentanteFundoSemVinculo,
} from 'src/@types/entities/fundos';

export abstract class RepresentanteFundoRepositorio extends Repositorio {
  abstract encontrarPorContato(
    cpf?: string,
    telefone?: string,
    email?: string,
  ): Promise<RepresentanteFundo | null>;

  abstract criarRepresentante(
    data: Omit<RepresentanteFundo, 'id'>,
  ): Promise<RepresentanteFundo>;

  abstract atualizar(
    id: number,
    data: Partial<RepresentanteFundoSemVinculo>,
  ): Promise<RepresentanteFundo>;

  abstract remover(id: number): Promise<void>;
}
