import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { TokenUsadoRepositorio } from '../contratos/tokenUsadoRepositorio';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaTokenUsadoRepositorio implements TokenUsadoRepositorio {
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }
  async criar(
    token: string,
    dataCriacao: Date,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    const client = prisma || this.prisma;

    await client.token_usado.create({
      data: {
        token,
        data_criacao: dataCriacao.toISOString(),
      },
    });
  }
}
