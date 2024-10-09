import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { fundo_investimento } from '@prisma/client';
import { FundoInvestimentoRepositorio } from '../contratos/fundoInvestimentoRepositorio';
import { FundoInvestimento } from 'src/@types/entities/fundos';
import { converterCamposDecimais } from 'src/utils/prisma/functions';

@Injectable()
export class PrismaFundoInvestimentoRepositorio
  implements FundoInvestimentoRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  async encontrarPorId(id: number): Promise<FundoInvestimento | null> {
    const fundoDados = await this.prisma.fundo_investimento.findUnique({
      where: { id },
    });
    return converterCamposDecimais(fundoDados);
  }
}
