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

  async buscarPorGestorFundo(id: number): Promise<OperacaoDebenture[]> {
    const operacoes = await this.prisma.operacao_debenture.findMany({
      where: {
        debenture_serie_investidor: {
          fundo_investimento: {
            fundo_investimento_gestor_fundo: {
              some: {
                id_gestor_fundo: id,
              },
            },
          },
        },
      },
      include: {
        debenture_serie_investidor: {
          include: {
            fundo_investimento: true,
            debenture_serie: {
              include: {
                debenture: true,
              },
            },
            conta_investidor: true,
          },
        },
      },
    });
    return converterCamposDecimais(operacoes);
  }
}
