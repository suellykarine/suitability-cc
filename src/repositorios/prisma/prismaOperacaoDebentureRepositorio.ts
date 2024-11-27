import { OperacaoDebentureRepositorio } from '../contratos/operacaoDebentureRepositorio';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { OperacaoDebenture } from 'src/@types/entities/operacaoDebenture';
import { converterCamposDecimais } from 'src/utils/prisma/functions';

@Injectable()
export class PrismaOperacaoDebentureRepositorio
  implements OperacaoDebentureRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorFundoInvestimento(id: number): Promise<OperacaoDebenture[]> {
    const operacoes = await this.prisma.operacao_debenture.findMany({
      where: {
        debenture_serie_investidor: {
          id_fundo_investimento: id,
        },
      },
      include: {
        debenture_serie_investidor: {
          include: {
            debenture_serie: true,
          },
        },
      },
    });
    return converterCamposDecimais(operacoes);
  }
}
