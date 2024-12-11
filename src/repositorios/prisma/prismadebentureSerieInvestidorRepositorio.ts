import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  AtualizarProps,
  DebentureSerieInvestidorRepositorio,
  EncontrarPorDesvinculoProps,
} from '../contratos/debentureSerieInvestidorRepositorio';
import {
  AtualizaDebentureSerieInvestidorCreditSec,
  DebentureSerie,
  DebentureSerieInvestidor,
} from 'src/@types/entities/debenture';
import { Prisma } from '@prisma/client';
import { converterCamposDecimais } from 'src/utils/prisma/functions';

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
        include: {
          debenture_serie: {
            include: {
              debenture: true,
            },
          },
          fundo_investimento: {
            include: {
              representante_fundo: true,
              documento: true,
              administrador_fundo: {
                include: {
                  endereco: true,
                },
              },
              fundo_investimento_gestor_fundo: {
                include: {
                  gestor_fundo: {
                    include: {
                      status_gestor_fundo: true,
                      endereco: true,
                    },
                  },
                  usuario_fundo_investimento: {
                    include: {
                      usuario: {
                        include: {
                          endereco: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          conta_investidor: true,
          operacao_debenture: true,
        },
      });

    return converterCamposDecimais(serieInvestidorData);
  }

  async encontrarPorIdFundoInvestimento({
    id_fundo_investimento,
  }: Pick<DebentureSerieInvestidor, 'id_fundo_investimento'>) {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.findMany({
        where: { id_fundo_investimento },
        include: { debenture_serie: true, conta_investidor: true },
      });

    return serieInvestidorData.map(converterCamposDecimais);
  }

  async encontrarMaisRecentePorIdFundoInvestimento({
    id_fundo_investimento,
  }: Pick<DebentureSerieInvestidor, 'id_fundo_investimento'>) {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.findFirst({
        where: { id_fundo_investimento },
        orderBy: { data_vinculo: 'desc' },
        include: {
          debenture_serie: {
            include: {
              debenture: true,
            },
          },
          conta_investidor: true,
        },
      });

    return converterCamposDecimais(serieInvestidorData);
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
            data_vencimento: null,
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
        include: {
          conta_investidor: true,
          debenture_serie: {
            include: {
              debenture: true,
            },
          },
        },
      });

    return converterCamposDecimais(serieInvestidorData);
  }

  async atualizar({
    id,
    id_conta_investidor,
    id_debenture_serie,
    id_fundo_investimento,
    ...data
  }: AtualizarProps): Promise<DebentureSerieInvestidor> {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.update({
        where: { id },
        data: {
          ...data,
          ...(id_conta_investidor && {
            conta_investidor: {
              connect: { id: id_conta_investidor },
            },
          }),
          ...(id_debenture_serie && {
            debenture_serie: {
              connect: { id: id_debenture_serie },
            },
          }),
          ...(id_fundo_investimento && {
            fundo_investimento: {
              connect: { id: id_fundo_investimento },
            },
          }),
        },
      });

    return serieInvestidorData;
  }

  async encontrarMaisRecentePorIdDebentureSerie(id_debenture_serie: number) {
    const debentureSerieInvestidor =
      await this.prisma.debenture_serie_investidor.findFirst({
        where: { id_debenture_serie },
        orderBy: { data_vinculo: 'desc' },
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
      include: {
        debenture_serie: {
          include: {
            debenture: true,
          },
        },
        conta_investidor: true,
        fundo_investimento: true,
      },
    });
    return converterCamposDecimais(data);
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

  async buscarTodasSeriesAptasParaInvestir({
    idFundoInvestimento,
    idDebenture,
  }: {
    idFundoInvestimento: number;
    idDebenture: number;
  }): Promise<DebentureSerie[]> {
    const debentureSeries =
      await this.prisma.debenture_serie_investidor.findMany({
        where: {
          id_fundo_investimento: idFundoInvestimento,
          debenture_serie: {
            id_debenture: idDebenture,
          },
          OR: [
            {
              status_retorno_creditsec: 'LIBERADO',
            },
            {
              data_encerramento: null,
              data_desvinculo: null,
              status_retorno_laqus: 'APROVADO',
              status_retorno_creditsec: 'APROVADO',
              debenture_serie: {
                data_vencimento: {
                  gte: new Date(),
                },
              },
            },
          ],
        },
        include: {
          debenture_serie: {
            include: {
              debenture: true,
            },
          },
        },
      });
    return converterCamposDecimais(
      debentureSeries.map((serie) => serie.debenture_serie),
    );
  }
}
