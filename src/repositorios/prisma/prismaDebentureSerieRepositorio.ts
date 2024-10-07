import { Prisma, debenture_serie } from '@prisma/client';
import { DebentureSerieRepositorio } from '../contratos/debenturesSerieRepositorio';
import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaDebentureSerieRepositorio
  implements DebentureSerieRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  async criar(
    debentureSerie: Prisma.debenture_serieCreateInput,
  ): Promise<debenture_serie> {
    return this.prisma.debenture_serie.create({
      data: debentureSerie,
    });
  }

  async encontrarPorId(id: number): Promise<debenture_serie | null> {
    return this.prisma.debenture_serie.findUnique({
      where: { id },
    });
  }

  async encontrarTodos(
    limite: number,
    deslocamento: number,
  ): Promise<debenture_serie[]> {
    return this.prisma.debenture_serie.findMany({
      skip: deslocamento,
      take: limite,
    });
  }

  async atualizar(
    id: number,
    debentureSerie: Prisma.debenture_serieUpdateInput,
  ): Promise<debenture_serie | null> {
    return this.prisma.debenture_serie.update({
      where: { id },
      data: debentureSerie,
    });
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
  ): Promise<debenture_serie[]> {
    const seriesExistentes = await this.prisma.debenture_serie.findMany({
      where: { id_debenture: idDebenture },
      orderBy: { numero_serie: 'asc' },
    });

    return seriesExistentes;
  }
}
