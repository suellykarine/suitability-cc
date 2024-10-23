import { Prisma } from '@prisma/client';
import { DebentureSerieRepositorio } from '../contratos/debenturesSerieRepositorio';
import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { converterCamposDecimais } from 'src/utils/prisma/functions';
import { DebentureSerie } from 'src/@types/entities/debenture';
import { AtualizarDebentureSerieDto } from 'src/app/debentures/dto/atualizar-debenture-serie.dto';

@Injectable()
export class PrismaDebentureSerieRepositorio
  implements DebentureSerieRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  async criar(
    debentureSerie: Omit<DebentureSerie, 'id'>,
    sessao?: Prisma.TransactionClient,
  ): Promise<DebentureSerie> {
    const prismaClient = sessao ?? this.prisma;

    const { id_debenture, ...restoDebentureSerie } = debentureSerie;

    const debentureSerieData = await prismaClient.debenture_serie.create({
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
    sessao?: Prisma.TransactionClient,
  ): Promise<DebentureSerie | null> {
    const prismaClient = sessao ?? this.prisma;

    const updatedDebentureSerie = await prismaClient.debenture_serie.update({
      where: { id },
      data: debentureSerie,
    });

    return converterCamposDecimais(updatedDebentureSerie);
  }
  async deletar(id: number, sessao?: Prisma.TransactionClient): Promise<void> {
    const prismaClient = sessao ?? this.prisma;

    await prismaClient.debenture_serie.delete({
      where: { id },
    });
  }

  async contarSeries(idDebenture: number): Promise<number> {
    return await this.prisma.debenture_serie.count({
      where: { id_debenture: idDebenture },
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
}
