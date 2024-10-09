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

  async encontrarPorDesvinculo(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null> {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.findFirst({
        where: {
          data_desvinculo: {
            not: null,
          },
          id_fundo_investimento: idFundoInvestimento,
        },
        include: { debenture_serie: true },
      });
    return converterCamposDecimais(serieInvestidorData);
  }

  async encontrarPorEncerramento(
    idFundoInvestimento: number,
  ): Promise<DebentureSerieInvestidor | null> {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.findFirst({
        where: {
          data_encerramento: {
            not: null,
          },
          id_fundo_investimento: idFundoInvestimento,
        },
        include: { debenture_serie: true },
      });
    return converterCamposDecimais(serieInvestidorData);
  }

  async criar(
    data: Omit<Partial<DebentureSerieInvestidor>, 'id'>,
  ): Promise<DebentureSerieInvestidor> {
    const serieInvestidorData =
      await this.prisma.debenture_serie_investidor.create({
        data: data as Prisma.debenture_serie_investidorCreateInput,
      });

    return serieInvestidorData;
  }
}
