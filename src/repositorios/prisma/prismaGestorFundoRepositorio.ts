import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { GestorFundoRepositorio } from '../contratos/gestorFundoRepositorio';
import { Prisma, gestor_fundo } from '@prisma/client';

@Injectable()
export class PrismaGestorFundoRepositorio implements GestorFundoRepositorio {
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }
  async encontrarPorCnpj(cnpj: string): Promise<gestor_fundo | null> {
    return this.prisma.gestor_fundo.findFirst({
      where: { cnpj },
    });
  }

  async criar(
    data: any,
    prisma?: Prisma.TransactionClient,
  ): Promise<gestor_fundo> {
    const clinet = prisma || this.prisma;

    return await clinet.gestor_fundo.create({
      data,
    });
  }
}
