import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Endereco, EnderecoSemVinculo } from 'src/@types/entities/endereco';
import { EnderecoRepositorio } from '../contratos/enderecoRepositorio';
import { omitir } from 'src/utils/funcoes/omitir';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaEnderecoRepositorio implements EnderecoRepositorio {
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }

  async criar(data: Omit<EnderecoSemVinculo, 'id'>): Promise<Endereco> {
    return this.prisma.endereco.create({
      data,
    });
  }

  async atualizar(
    id: number,
    dadosAtualizados: Partial<Omit<EnderecoSemVinculo, 'id'>>,
  ): Promise<Endereco | null> {
    return await this.prisma.endereco.update({
      where: { id },
      data: dadosAtualizados,
    });
  }

  async buscarPorId(id: number): Promise<Endereco | null> {
    return await this.prisma.endereco.findUnique({
      where: { id },
    });
  }
  async remover(id: number): Promise<void> {
    await this.prisma.endereco.delete({
      where: { id },
    });
  }
}
