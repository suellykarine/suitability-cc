import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { DebentureRepositorio } from '../contratos/debentureRepositorio';
import { Debenture } from 'src/@types/entities/debenture';
import { converterCamposDecimais } from 'src/utils/prisma/functions';

@Injectable()
export class PrismaDebentureRepositorio implements DebentureRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async encontrarPorId(id: number): Promise<Debenture | null> {
    const debenture = await this.prisma.debenture.findUnique({
      where: { id },
      include: { debenture_serie: true },
    });

    return converterCamposDecimais(debenture);
  }

  async buscarPorNome(nome: string): Promise<Debenture | null> {
    const debenture = await this.prisma.debenture.findUnique({
      where: { nome_debenture: nome },
      include: { debenture_serie: true },
    });

    return converterCamposDecimais(debenture);
  }

  async buscarAtiva(): Promise<Debenture | null> {
    const debenture = await this.prisma.debenture.findFirst({
      orderBy: { data_emissao: 'desc' },
      where: { data_vencimento: { gt: new Date() } },
      include: { debenture_serie: true },
    });
    return converterCamposDecimais(debenture);
  }

  async buscarPorNumero(numero: number): Promise<Debenture | null> {
    const debenture = await this.prisma.debenture.findUnique({
      where: { numero_debenture: numero },
      include: { debenture_serie: true },
    });

    return converterCamposDecimais(debenture);
  }
  async criarDebenture(
    data: Omit<Debenture, 'id' | 'debenture_serie'>,
  ): Promise<Debenture> {
    const novaDebenture = await this.prisma.debenture.create({
      data: data,
    });

    return converterCamposDecimais(novaDebenture);
  }

  async listarDebentures(): Promise<Debenture[]> {
    const debentures = await this.prisma.debenture.findMany({
      include: { debenture_serie: true },
    });

    return debentures.map(converterCamposDecimais);
  }
}
