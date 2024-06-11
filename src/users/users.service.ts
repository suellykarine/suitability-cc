import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

export type User = any;

@Injectable()
export class UsersService {
  async findOne(email: string): Promise<User | undefined> {
    const prisma = new PrismaClient();
    const user = await prisma.usuario.findUnique({
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

    return user;
  }

  async findUserMaster(email: string): Promise<User | undefined> {
    const prisma = new PrismaClient();

    const user = prisma.usuario.findUnique({
      where: {
        email: email,
      },
    });

    return user;
  }
}
