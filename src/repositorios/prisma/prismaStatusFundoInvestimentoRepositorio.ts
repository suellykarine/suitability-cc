import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { StatusFundoInvestimentoRepositorio } from '../contratos/statusFundoInvestimentoRepositorio';
import { StatusFundoInvestimento } from 'src/@types/entities/fundos';

@Injectable()
export class PrismaStatusFundoInvestimentoRepositorio
  implements StatusFundoInvestimentoRepositorio
{
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }

  async encontrarPorNome(
    nome: string,
  ): Promise<StatusFundoInvestimento | null> {
    const statusFundo = await this.prisma.status_fundo_investimento.findFirst({
      where: { nome },
    });
    return statusFundo;
  }
}
