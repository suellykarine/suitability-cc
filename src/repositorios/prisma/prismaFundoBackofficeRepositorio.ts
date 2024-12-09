import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { FundoBackofficeRepositorio } from '../contratos/fundoBackofficeRepositorio';
import {
  FundoBackoffice,
  FundoBackofficeSemVinculo,
} from 'src/@types/entities/backoffice';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaFundoBackofficeRepositorio
  implements FundoBackofficeRepositorio
{
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }

  async encontrarPorEmail(email: string): Promise<FundoBackoffice | null> {
    const fundoBackoffice = await this.prisma.fundo_backoffice.findUnique({
      where: {
        email,
      },
    });
    return fundoBackoffice;
  }

  async criar(
    data: Omit<FundoBackofficeSemVinculo, 'id'>,
  ): Promise<FundoBackoffice | null> {
    const fundoBackoffice = await this.prisma.fundo_backoffice.create({
      data,
    });

    return fundoBackoffice;
  }

  async atualizar(
    id: number,
    data: Partial<FundoBackofficeSemVinculo>,
  ): Promise<FundoBackoffice> {
    return await this.prisma.fundo_backoffice.update({
      where: { id },
      data,
    });
  }

  async remover(id: number): Promise<void> {
    await this.prisma.fundo_backoffice.delete({
      where: { id },
    });
  }
}
