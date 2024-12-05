import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ContaRepasseRepositorio } from '../contratos/contaRepasseRepositorio';
import {
  ContaRepasse,
  ContaRepasseSemVinculo,
} from 'src/@types/entities/contaRepasse';

@Injectable()
export class PrismaContaRepasseRepositorio implements ContaRepasseRepositorio {
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }

  async criar(data: Omit<ContaRepasseSemVinculo, 'id'>): Promise<ContaRepasse> {
    const contaRepasse = await this.prisma.conta_repasse.create({
      data: {
        codigo_banco: data.codigo_banco,
        agencia: data.agencia,
        conta_bancaria: data.conta_bancaria,
        fundo_investimento: {
          connect: { id: data.id_fundo_investimento },
        },
      },
    });

    return contaRepasse;
  }

  async encontrarPorId(id: number): Promise<ContaRepasse | null> {
    const contaRepasse = await this.prisma.conta_repasse.findUnique({
      where: { id },
    });

    return contaRepasse;
  }

  async atualizar(
    idFundo: number,
    data: Partial<ContaRepasseSemVinculo>,
  ): Promise<ContaRepasse> {
    return await this.prisma.conta_repasse.update({
      where: { id_fundo_investimento: idFundo },
      data,
    });
  }

  async removerPorFundo(idFundo: number): Promise<void> {
    await this.prisma.conta_repasse.deleteMany({
      where: { id_fundo_investimento: idFundo },
    });
  }
}
