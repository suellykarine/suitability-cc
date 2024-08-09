import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export type Usuario = any;

@Injectable()
export class UsuarioService {
  async encontrarUsuario(email: string): Promise<Usuario | undefined> {
    const prisma = new PrismaClient();
    const usuario = await prisma.usuario.findUnique({
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
    const prisma = new PrismaClient();

    const usuario = prisma.usuario.findUnique({
      where: {
        email: email,
      },
    });

    return usuario;
  }
}
