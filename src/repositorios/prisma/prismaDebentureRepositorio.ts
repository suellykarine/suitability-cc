import { debenture } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { DebentureRepositorio } from '../contratos/debentureRepositorio';

@Injectable()
export class PrismaDebentureRepositorio implements DebentureRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async encontrarPorId(id: number): Promise<debenture | null> {
    return this.prisma.debenture.findUnique({
      where: { id },
    });
  }
}
