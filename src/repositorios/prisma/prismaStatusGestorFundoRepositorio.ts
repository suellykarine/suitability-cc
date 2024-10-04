import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { StatusGestorFundoRepositorio } from '../contratos/statusGestorFundoRepositorio';
import { status_gestor_fundo } from '@prisma/client';

@Injectable()
export class PrismaStatusGestorFundoRepositorio
  implements StatusGestorFundoRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  async encontrarPorNome(nome: string): Promise<status_gestor_fundo | null> {
    return this.prisma.status_gestor_fundo.findFirst({
      where: { nome },
    });
  }
}
