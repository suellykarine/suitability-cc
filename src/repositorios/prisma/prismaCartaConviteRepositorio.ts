import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CartaConviteRepositorio } from '../contratos/cartaConviteRepositorio';
import { carta_convite } from '@prisma/client';
import { StatusCartaConvite } from 'src/enums/StatusCartaConvite';

@Injectable()
export class PrismaCartaConviteRepositorio implements CartaConviteRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async encontrarPorIdEAprovado(id: number): Promise<carta_convite | null> {
    return this.prisma.carta_convite.findFirst({
      where: {
        id,
        status_carta_convite: {
          nome: StatusCartaConvite.APROVADO,
        },
      },
      include: {
        status_carta_convite: true,
      },
    });
  }
}
