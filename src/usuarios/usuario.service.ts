import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
