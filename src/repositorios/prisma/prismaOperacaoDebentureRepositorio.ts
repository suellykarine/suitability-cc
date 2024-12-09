import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { OperacaoDebentureRepositorio } from '../contratos/operacaoDebentureRepositorio';
import {
  OperacaoDebenture,
  OperacaoDebentureSemVinculo,
} from 'src/@types/entities/operacaoDebenture';
import { converterCamposDecimais } from 'src/utils/prisma/functions';

@Injectable()
export class PrismaOperacaoDebentureRepositorio
  implements OperacaoDebentureRepositorio
{
  constructor(private prisma: PrismaService) {}

  async criar(
    data: Omit<OperacaoDebentureSemVinculo, 'id'>,
  ): Promise<OperacaoDebenture> {
    return await this.prisma.operacao_debenture.create({
      data,
    });
  }

  async atualizar(
    {
      id_debenture_serie_investidor,
      ...data
    }: Partial<Omit<OperacaoDebentureSemVinculo, 'id'>>,
    id: number,
  ): Promise<OperacaoDebenture> {
    return await this.prisma.operacao_debenture.update({
      where: { id },
      data: {
        ...data,
        ...(id_debenture_serie_investidor && {
          debenture_serie_investidor: {
            connect: { id: id_debenture_serie_investidor },
          },
        }),
      },
    });
  }

  async buscarOperacoesPeloCodigoOperacao(
    codigo_operacao: string,
  ): Promise<OperacaoDebenture[]> {
    return await this.prisma.operacao_debenture.findMany({
      where: { codigo_operacao: Number(codigo_operacao) },
    });
  }

  async buscarOperacoesPeloStatusCreditSec(
    statusCreditSec: string,
  ): Promise<OperacaoDebenture[]> {
    return await this.prisma.operacao_debenture.findMany({
      where: { status_retorno_creditsec: statusCreditSec },
    });
  }

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
