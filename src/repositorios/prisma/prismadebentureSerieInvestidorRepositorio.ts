import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { DebentureSerieInvestidorRepositorio } from '../contratos/debentureSerieInvestidorRepositorio';
import { DebentureSerieInvestidor } from 'src/@types/entities/debenture';
import { Prisma } from '@prisma/client';
import { converterCamposDecimais } from 'src/utils/prisma/functions';

@Injectable()
export class PrismaDebentureSerieInvestidorRepositorio
  implements DebentureSerieInvestidorRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  async encontrarPorId(id: number): Promise<DebentureSerieInvestidor | null> {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.findUnique({
        where: { id },
        include: { debenture_serie: true },
      });

    return converterCamposDecimais(serieInvestidorData);
  }

  async encontrarPorDesvinculo(): Promise<DebentureSerieInvestidor | null> {
    return this.encontrarPorCampo('data_desvinculo');
  }

  async encontrarPorEncerramento(): Promise<DebentureSerieInvestidor | null> {
    return this.encontrarPorCampo('data_encerramento');
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

  async encontrarPorIdDebentureSerie(id_debenture_serie: number) {
    const debentureSerieInvestidor =
      await this.prisma.debenture_serie_investidor.findFirst({
        where: { id_debenture_serie },
      });
    return debentureSerieInvestidor;
  }
  async atualizaDebentureSerieInvestidor(
    id_debenture_serie_investidor: number,
    status: string,
    motivo: string,
  ): Promise<DebentureSerieInvestidor> {
    const atualizaDebentureSerieInvestidor =
      await this.prisma.debenture_serie_investidor.update({
        where: { id: id_debenture_serie_investidor },
        data: {
          status_retorno_creditsec: status,
          mensagem_retorno_creditsec: motivo ?? null,
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

  private async encontrarPorCampo(
    campo: Extract<
      keyof DebentureSerieInvestidor,
      'data_encerramento' | 'data_desvinculo'
    >,
  ): Promise<DebentureSerieInvestidor | null> {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.findFirst({
        where: {
          [campo]: {
            not: null,
          },
        },
        include: { debenture_serie: true, conta_investidor: true },
      });

    return converterCamposDecimais(serieInvestidorData);
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
}
