import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ContaInvestidorRepositorio } from '../contratos/contaInvestidorRespositorio';
import {
  ContaInvestidor,
  ContaInvestidorSemVinculos,
} from 'src/@types/entities/contaInvestidor';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaContaInvestidorRepositorio
  implements ContaInvestidorRepositorio
{
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }

  async atualizar(
    id: number,
    {
      id_fundo_investidor,
      ...contaInvestidor
    }: Partial<Omit<ContaInvestidorSemVinculos, 'id'>>,
  ): Promise<ContaInvestidorSemVinculos | null> {
    return await this.prisma.conta_investidor.update({
      where: { id },
      data: {
        ...contaInvestidor,
        ...(id_fundo_investidor && {
          fundo_investimento: { connect: { id: id_fundo_investidor } },
        }),
      },
    });
  }

  async criarContaInvestidor(
    dados: Omit<ContaInvestidorSemVinculos, 'id'>,
  ): Promise<ContaInvestidorSemVinculos> {
    const { id_fundo_investidor, ...restoDados } = dados;

    const dadosCriacao: Prisma.conta_investidorCreateInput = {
      ...restoDados,
      ...(id_fundo_investidor && {
        fundo_investimento: {
          connect: { id: id_fundo_investidor },
        },
      }),
    };
    return await this.prisma.conta_investidor.create({
      data: dadosCriacao,
    });
  }
  async buscarContaInvestidorPorIdentificadorFundo(
    idenficadorFundo: number,
  ): Promise<ContaInvestidor | null> {
    const contaInvestidor = await this.prisma.conta_investidor.findFirst({
      where: {
        id_fundo_investidor: idenficadorFundo,
      },
    });
    return contaInvestidor;
  }
}
