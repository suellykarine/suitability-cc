import { ProcuradorFundoFundoInvestimentoRepositorio } from '../contratos/procuradorFundoFundoInvestimentoRepositorio';
import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ProcuradorFundoFundoInvestimento,
  ProcuradorFundoFundoInvestimentoSemVinculo,
} from 'src/@types/entities/fundos';

@Injectable()
export class PrismaProcuradorFundoFundoInvestimentoRepositorio
  implements ProcuradorFundoFundoInvestimentoRepositorio
{
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }

  async removerPorFundo(idFundo: number): Promise<void> {
    await this.prisma.procurador_fundo_fundo_investimento.deleteMany({
      where: { id_fundo_investimento: idFundo },
    });
  }

  async buscarPorProcurador(
    idProcurador: number,
  ): Promise<ProcuradorFundoFundoInvestimento[]> {
    return this.prisma.procurador_fundo_fundo_investimento.findMany({
      where: { id_procurador_fundo: idProcurador },
    });
  }

  async criar(
    data: Omit<ProcuradorFundoFundoInvestimentoSemVinculo, 'id'>,
  ): Promise<ProcuradorFundoFundoInvestimentoSemVinculo> {
    return this.prisma.procurador_fundo_fundo_investimento.create({ data });
  }
}
