import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { FundoInvestimentoRepositorio } from '../contratos/fundoInvestimentoRepositorio';
import { converterCamposDecimais } from 'src/utils/prisma/functions';
import { FundoInvestimento } from 'src/@types/entities/fundos';

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
