import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  atualizarDatasDebentureSerie,
  DebentureSerie,
} from 'src/@types/entities/debenture';
import { converterCamposDecimais } from 'src/utils/prisma/functions';
import { DebentureSerieRepositorio } from '../contratos/debenturesSerieRepositorio';
import { AtualizarDebentureSerieDto } from 'src/app/debentures/dto/atualizar-debenture-serie.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaDebentureSerieRepositorio
  implements DebentureSerieRepositorio
{
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }

  async criar(
    debentureSerie: Omit<DebentureSerie, 'id' | 'debenture_serie_investidor'>,
  ): Promise<DebentureSerie> {
    const { id_debenture, ...restoDebentureSerie } = debentureSerie;

    const debentureSerieData = await this.prisma.debenture_serie.create({
      data: {
        ...restoDebentureSerie,
        debenture: {
          connect: { id: id_debenture },
        },
      },
    });
    return converterCamposDecimais(debentureSerieData);
  }

  async encontrarPorId(id: number): Promise<DebentureSerie | null> {
    const data = await this.prisma.debenture_serie.findUnique({
      where: { id },
    });
    return data ? converterCamposDecimais(data) : null;
  }

  async encontrarTodos(
    limite: number,
    deslocamento: number,
  ): Promise<DebentureSerie[]> {
    const series = await this.prisma.debenture_serie.findMany({
      skip: deslocamento,
      take: limite,
    });
    return series.map(converterCamposDecimais);
  }

  async atualizar(
    id: number,
    debentureSerie: AtualizarDebentureSerieDto,
  ): Promise<DebentureSerie | null> {
    const updatedDebentureSerie = await this.prisma.debenture_serie.update({
      where: { id },
      data: debentureSerie,
    });

    return converterCamposDecimais(updatedDebentureSerie);
  }
  async deletar(id: number): Promise<void> {
    await this.prisma.debenture_serie.delete({
      where: { id },
    });
  }

  async contarSeriesTotal(): Promise<number> {
    return await this.prisma.debenture_serie.count();
  }

  async encontrarSeriesPorIdDebenture(
    idDebenture: number,
  ): Promise<DebentureSerie[]> {
    const seriesExistentes = await this.prisma.debenture_serie.findMany({
      where: { id_debenture: idDebenture },
      orderBy: { numero_serie: 'asc' },
    });
    return seriesExistentes.map(converterCamposDecimais);
  }

  async encontrarSeriePorNumeroSerie(
    numero_serie: number,
  ): Promise<DebentureSerie | null> {
    const debenture_serie = await this.prisma.debenture_serie.findFirst({
      where: { numero_serie: numero_serie },
    });
    return converterCamposDecimais(debenture_serie);
  }

  async atualizaDatasDebentureSerie(
    data: atualizarDatasDebentureSerie,
  ): Promise<DebentureSerie> {
    const atualizaDatasDebentureSerie =
      await this.prisma.debenture_serie.update({
        where: { id: data.id_debenture_serie },
        data: {
          data_emissao: data.data_emissao,
          data_vencimento: data.data_vencimento,
        },
      });
    return converterCamposDecimais(atualizaDatasDebentureSerie);
  }
}
