import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  AtualizarStatusRetornoLaqus,
  DebentureSerieInvestidorRepositorio,
} from '../contratos/debentureSerieInvestidorRepositorio';
import { DebentureSerieInvestidor } from 'src/@types/entities/debenture';
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
        include: { debenture_serie: true },
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
        include: { debenture_serie: true },
      });

    return converterCamposDecimais(serieInvestidorData);
  }

  async atualizarStatusLaqus({
    status,
    justificativa,
    idFundoInvestimento,
  }: AtualizarStatusRetornoLaqus): Promise<RetornoMultiplos> {
    const debentureSerieInvestidor =
      await this.prisma.debenture_serie_investidor.updateMany({
        where: {
          id_fundo_investimento: idFundoInvestimento,
          status_retorno_laqus: 'Pendente',
        },
        data: {
          status_retorno_laqus: status,
          mensagem_retorno_laqus: justificativa,
        },
      });

    return debentureSerieInvestidor;
  }
}
