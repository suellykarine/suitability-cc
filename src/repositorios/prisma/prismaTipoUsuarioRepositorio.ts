import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TipoUsuarioRepositorio } from '../contratos/tipoUsuarioRepositorio';
import { tipo_usuario } from '@prisma/client';

@Injectable()
export class PrismaTipoUsuarioRepositorio implements TipoUsuarioRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async encontrarPorTipo(tipo: string): Promise<tipo_usuario | null> {
    return this.prisma.tipo_usuario.findFirst({
      where: { tipo },
    });
  }
}
