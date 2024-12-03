import { Repositorio } from './repositorio';
import {
  Usuario,
  UsuarioComSenha,
  UsuarioSemVinculosComSenha,
} from 'src/@types/entities/usuario';

export abstract class UsuarioRepositorio extends Repositorio {
  abstract encontrarTodos(): Promise<Usuario[]>;
  abstract encontrarPorId(id: number): Promise<Usuario | null>;
  abstract encontrarPorEmail(email: string): Promise<Usuario | null>;
  abstract criar(
    data: Omit<UsuarioSemVinculosComSenha, 'id'>,
  ): Promise<Usuario>;
  abstract atualizar(
    id: number,
    data: Partial<Omit<UsuarioSemVinculosComSenha, 'id'>>,
  ): Promise<Usuario>;
  abstract deletar(id: number): Promise<void>;
  abstract atualizarStatusETipo(
    id: number,
    idStatusUsuario: number | null,
    idTipoUsuario: number | null,
  ): Promise<Usuario>;

  abstract encontrarPorIdComSenha(id: number): Promise<UsuarioComSenha | null>;

  abstract encontrarTodosPorTipoUsuario(
    desvio: number,
    limite: number,
    tipoUsuario?: string,
  ): Promise<Usuario[] | null>;

  abstract contarUsuariosPorTipo(tipoUsuario: string): Promise<number>;

  abstract adicionarTokenUsuario(
    token: string,
    idUsuario: number,
  ): Promise<{ tokenRenovacao: string }>;

  abstract buscarTokenRenovacao(id: number): Promise<string | null>;

  abstract logout(idUsuario: number): Promise<void>;
}
