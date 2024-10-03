import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AtualizarSenhaDto } from './dto/atualizar-senha.dto';
import { PrismaUsuarioRepositorio } from 'src/repositorios/prisma/prismaUsuarioRepositorio';

export type Usuario = any;

@Injectable()
export class UsuarioService {
  constructor(private prismaUsuarioRepositorio: PrismaUsuarioRepositorio) {}

  async encontrarUsuario(email: string): Promise<Usuario | undefined> {
    const usuario =
      await this.prismaUsuarioRepositorio.encontrarPorEmail(email);

    return usuario;
  }

  async atualizarSenha(
    idUsuario: number,
    atualizarSenhaDto: AtualizarSenhaDto,
  ) {
    atualizarSenhaDto.senha = await bcrypt.hash(atualizarSenhaDto.senha, 10);

    await this.prismaUsuarioRepositorio.atualizar(idUsuario, atualizarSenhaDto);

    return { mensagem: 'Senha alterada com sucesso' };
  }
}
