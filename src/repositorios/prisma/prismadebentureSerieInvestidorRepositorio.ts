import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  AtualizarProps,
  DebentureSerieInvestidorRepositorio,
  EncontrarPorDesvinculoProps,
} from '../contratos/debentureSerieInvestidorRepositorio';
import {
  AtualizaDebentureSerieInvestidorCreditSec,
  AtualizarDebentureSerieInvestidorLaqus,
  DebentureSerieInvestidor,
} from 'src/@types/entities/debenture';
import { Prisma } from '@prisma/client';
import { converterCamposDecimais } from 'src/utils/prisma/functions';
import { RetornoMultiplos } from 'src/utils/prisma/types';

@Injectable()
export class PrismaDebentureSerieInvestidorRepositorio
  implements DebentureSerieInvestidorRepositorio
{
  constructor(private prisma: PrismaService) {}
  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }
  async encontrarPorId(id: number): Promise<DebentureSerieInvestidor | null> {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.findUnique({
        where: { id },
        include: { debenture_serie: true },
      });

    return converterCamposDecimais(serieInvestidorData);
  }

  async encontrarPorIdFundoInvestimento({
    id_fundo_investimento,
  }: Pick<DebentureSerieInvestidor, 'id_fundo_investimento'>) {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.findMany({
        where: { id_fundo_investimento },
      });

    return serieInvestidorData.map(converterCamposDecimais);
  }

  async encontrarPorDesvinculo({
    idDebenture,
    valorMinimoSerie = 0,
  }: EncontrarPorDesvinculoProps): Promise<DebentureSerieInvestidor | null> {
    const debentureSerie =
      await this.prisma.debenture_serie_investidor.findFirst({
        where: {
          data_desvinculo: {
            not: null,
          },
          debenture_serie: {
            data_emissao: null,
            debenture_serie_investidor: {
              every: {
                OR: [
                  {
                    data_desvinculo: {
                      not: null,
                    },
                  },
                  {
                    data_encerramento: {
                      not: null,
                    },
                  },
                ],
              },
            },
            id_debenture: idDebenture,
            valor_serie: {
              gte: valorMinimoSerie,
            },
          },
        },
        orderBy: {
          debenture_serie: {
            valor_serie: 'desc',
          },
        },
        include: { debenture_serie: true, conta_investidor: true },
      });

    return converterCamposDecimais(debentureSerie);
  }

  async encontrarPorEncerramento(): Promise<DebentureSerieInvestidor | null> {
    const debentureSerie =
      await this.prisma.debenture_serie_investidor.findFirst({
        where: {
          data_encerramento: {
            not: null,
          },
          conta_investidor: {
            debenture_serie_investidor: {
              every: {
                OR: [
                  {
                    data_encerramento: {
                      not: null,
                    },
                  },
                  {
                    data_desvinculo: {
                      not: null,
                    },
                  },
                ],
              },
            },
          },
        },
        orderBy: {
          debenture_serie: {
            valor_serie: 'desc',
          },
        },
        include: { debenture_serie: true, conta_investidor: true },
      });

    return converterCamposDecimais(debentureSerie);
  }

  async encontrarPorIdContaInvestidorDataEncerramento(
    idContaInvestidor: number,
  ): Promise<DebentureSerieInvestidor | null> {
    return this.encontrarPorIdContaInvestidor(
      idContaInvestidor,
      'data_encerramento',
    );
  }

  async encontrarPorIdContaInvestidorDataDesvinculo(
    idContaInvestidor: number,
  ): Promise<DebentureSerieInvestidor | null> {
    return this.encontrarPorIdContaInvestidor(
      idContaInvestidor,
      'data_desvinculo',
    );
  }

  async criar({
    id_conta_investidor,
    id_debenture_serie,
    id_fundo_investimento,
    ...data
  }: Omit<
    Partial<DebentureSerieInvestidor>,
    'id'
  >): Promise<DebentureSerieInvestidor> {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.create({
        data: {
          ...(data as Prisma.debenture_serie_investidorCreateInput),
          conta_investidor: { connect: { id: id_conta_investidor } },
          debenture_serie: { connect: { id: id_debenture_serie } },
          fundo_investimento: { connect: { id: id_fundo_investimento } },
        },
      });

    return serieInvestidorData;
  }

  async atualizar({
    id,
    ...props
  }: AtualizarProps): Promise<DebentureSerieInvestidor> {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.update({
        where: { id },
        data: props,
      });

    return serieInvestidorData;
  }

  async encontrarPorIdDebentureSerie(id_debenture_serie: number) {
    const debentureSerieInvestidor =
      await this.prisma.debenture_serie_investidor.findFirst({
        where: { id_debenture_serie },
      });
    return debentureSerieInvestidor;
  }
  async atualizaDebentureSerieInvestidor(
    data: AtualizaDebentureSerieInvestidorCreditSec,
  ): Promise<DebentureSerieInvestidor> {
    const atualizaDebentureSerieInvestidor =
      await this.prisma.debenture_serie_investidor.update({
        where: { id: data.id_debenture_serie_investidor },
        data: {
          status_retorno_creditsec: data.status,
          mensagem_retorno_creditsec: data.motivo ?? null,
          data_desvinculo: data.data_desvinculo,
        },
      });
    return atualizaDebentureSerieInvestidor;
  }

  async todosStatusCreditSecNull(): Promise<DebentureSerieInvestidor[] | null> {
    const data = await this.prisma.debenture_serie_investidor.findMany({
      where: { status_retorno_creditsec: null },
    });
    return data;
  }

  private async encontrarPorIdContaInvestidor(
    idContaInvestidor: number,
    campo: 'data_encerramento' | 'data_desvinculo',
  ): Promise<DebentureSerieInvestidor | null> {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.findFirst({
        where: {
          [campo]: null,
          id_conta_investidor: idContaInvestidor,
        },
        include: { debenture_serie: true, conta_investidor: true },
      });

    return converterCamposDecimais(serieInvestidorData);
  }

  async atualizarStatusLaqus({
    mensagemRetornoLaqus,
    statusRetornoLaqus,
    idFundoInvestimento,
    dataDesvinculo,
  }: AtualizarDebentureSerieInvestidorLaqus): Promise<RetornoMultiplos> {
    const debentureSerieInvestidor =
      await this.prisma.debenture_serie_investidor.updateMany({
        where: {
          id_fundo_investimento: idFundoInvestimento,
          status_retorno_laqus: 'Pendente',
        },
        data: {
          status_retorno_laqus: statusRetornoLaqus,
          mensagem_retorno_laqus: mensagemRetornoLaqus,
          ...(dataDesvinculo !== undefined && {
            data_desvinculo: dataDesvinculo,
          }),
        },
      });

    return debentureSerieInvestidor;
  }
  async buscarTodasDebentureSerieValidas(
    idFundoInvestimento: number,
  ): Promise<number[]> {
    const debentures = await this.prisma.debenture_serie_investidor.findMany({
      where: {
        id_fundo_investimento: idFundoInvestimento,
        data_encerramento: null,
        data_desvinculo: null,
        status_retorno_laqus: 'Aprovado',
        status_retorno_creditsec: 'SUCCESS',
      },
      select: {
        id_debenture_serie: true,
      },
    });
    return debentures.map((debenture) => debenture.id_debenture_serie);
  }
}
