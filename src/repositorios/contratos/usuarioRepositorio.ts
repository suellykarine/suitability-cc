import { Prisma, status_usuario, tipo_usuario, usuario } from '@prisma/client';
import { AtualizarUsuarioDto } from 'src/app/adm/dto/update-adm.dto';
import { Repositorio } from './repositorio';
import { UsuarioComStatusETipo } from 'src/@types/entities/usuarioComStatusETipo';
import { Usuario } from 'src/app/usuarios/usuario.service';

export abstract class UsuarioRepositorio extends Repositorio {
  abstract encontrarTodos(): Promise<usuario[]>;
  abstract encontrarPorId(id: number): Promise<Usuario | null>;
  abstract encontrarPorEmail(email: string): Promise<usuario | null>;
  abstract criar(
    data: Usuario,
    prisma?: Prisma.TransactionClient,
  ): Promise<usuario>;
  abstract atualizar(id: number, data: AtualizarUsuarioDto): Promise<Usuario>;
  abstract deletar(id: number): Promise<void>;
  abstract atualizarStatusETipo(
    id: number,
    idStatusUsuario: number | null,
    idTipoUsuario: number | null,
  ): Promise<any>;

  abstract encontrarTodosPorTipoUsuario(
    desvio: number,
    limite: number,
    tipoUsuario?: string,
  ): Promise<Usuario[] | null>;

  abstract contarUsuariosPorTipo(tipoUsuario: string): Promise<number>;
}
