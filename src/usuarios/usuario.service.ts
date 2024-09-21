import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AtualizarSenhaDto } from './dto/atualizar-senha.dto';

export type Usuario = any;

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  async encontrarUsuario(email: string): Promise<Usuario | undefined> {
    const usuario = await this.prisma.usuario.findUnique({
      where: {
        email: email,
      },
      include: {
        gestor_fundo: true,
        status_usuario: true,
        tipo_usuario: true,
        transacao_carteira: true,
      },
    });

    return usuario;
  }

  async encontrarUsuarioMaster(email: string): Promise<Usuario | undefined> {
    const usuario = this.prisma.usuario.findUnique({
      where: {
        email: email,
      },
    });

    return usuario;
  }

  async atualizarSenha(
    idUsuario: number,
    atualizarSenhaDto: AtualizarSenhaDto,
  ) {
    const hashedPassword = await bcrypt.hash(atualizarSenhaDto.senha, 10);

    await this.prisma.usuario.update({
      where: { id: idUsuario },
      data: {
        senha: hashedPassword,
      },
    });

    return { mensagem: 'Senha alterada com sucesso' };
  }
}
