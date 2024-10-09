import { Prisma } from '@prisma/client';
import { DebentureSerieRepositorio } from '../contratos/debenturesSerieRepositorio';
import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { converterCamposDecimais } from 'src/utils/prisma/functions';
import { DebentureSerie } from 'src/@types/entities/debenture';
import { AtualizarDebentureSerieDto } from 'src/app/debentures/dto/atualizar-debenture.dto';

@Injectable()
export class PrismaDebentureSerieRepositorio
  implements DebentureSerieRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  async criar(
    debentureSerie: Omit<DebentureSerie, 'id'>,
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
