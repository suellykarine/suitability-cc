import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { StatusUsuarioRepositorio } from '../contratos/statusUsuarioRepositorio';
import { status_usuario } from '@prisma/client';

@Injectable()
export class PrismaStatusUsuarioRepositorio
  implements StatusUsuarioRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  async encontrarPorNome(nome: string): Promise<status_usuario | null> {
    return this.prisma.status_usuario.findFirst({
      where: { nome },
    });
  }
}
