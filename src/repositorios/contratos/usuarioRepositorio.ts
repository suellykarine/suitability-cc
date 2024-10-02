import { usuario } from '@prisma/client';
import { AtualizarUsuarioDto } from 'src/adm/dto/update-adm.dto';
import { CreateUsuarioDto } from 'src/usuarios/dto/criar-usuario.dto';

export abstract class UsuarioRepositorioContract {
  abstract encontrarTodos(): Promise<usuario[]>;
  abstract encontrarPorId(id: number): Promise<usuario | null>;
  abstract criar(data: CreateUsuarioDto): Promise<usuario>;
  abstract atualizar(id: number, data: AtualizarUsuarioDto): Promise<usuario>;
  abstract deletar(id: number): Promise<void>;
}
