import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';

import { FundoInvestimentoGestorFundo } from 'src/@types/entities/fundos';
import { FundoInvestimentoGestorFundoRepositorio } from '../contratos/fundoInvestimentoGestorFundoRepositorio';

@Injectable()
export class PrismaFundoInvestimentoGestorFundoRepositorio
  implements FundoInvestimentoGestorFundoRepositorio
{
  constructor(private readonly prisma: PrismaService) {}
  async encontrarPorIdDoFundo(
    id: number,
  ): Promise<FundoInvestimentoGestorFundo> {
    const fundoInvestimentoGestorFundo =
      await this.prisma.fundo_investimento_gestor_fundo.findFirst({
        where: { id_fundo_investimento: id },
      });
    return fundoInvestimentoGestorFundo;
  }
}
