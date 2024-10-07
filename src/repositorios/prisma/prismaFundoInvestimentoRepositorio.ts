import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { fundo_investimento } from '@prisma/client';
import { FundoInvestimentoRepositorio } from '../contratos/fundoInvestimentoRepositorio';

@Injectable()
export class PrismaFundoInvestimentoRepositorio
  implements FundoInvestimentoRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  async encontrarPorId(id: number): Promise<fundo_investimento | null> {
    return this.prisma.fundo_investimento.findUnique({
      where: { id },
    });
  }
}
