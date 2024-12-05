import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';

import { FundoInvestimentoGestorFundo } from 'src/@types/entities/fundos';
import { FundoInvestimentoGestorFundoRepositorio } from '../contratos/fundoInvestimentoGestorFundoRepositorio';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaFundoInvestimentoGestorFundoRepositorio
  implements FundoInvestimentoGestorFundoRepositorio
{
  constructor(private prisma: PrismaService) {}
  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }
  async encontrarPorIdDoFundo(
    id: number,
  ): Promise<FundoInvestimentoGestorFundo> {
    const fundoInvestimentoGestorFundo =
      await this.prisma.fundo_investimento_gestor_fundo.findFirst({
        where: { id_fundo_investimento: id },
      });
    return fundoInvestimentoGestorFundo;
  }

  async criar(
    data: Omit<FundoInvestimentoGestorFundo, 'id'>,
  ): Promise<FundoInvestimentoGestorFundo> {
    const fundoInvestimentoGestorFundo =
      await this.prisma.fundo_investimento_gestor_fundo.create({
        data: {
          id_fundo_investimento: data.id_fundo_investimento,
          id_gestor_fundo: data.id_gestor_fundo,
        },
      });

    return fundoInvestimentoGestorFundo;
  }

  async encontrarPorId(
    id: number,
  ): Promise<FundoInvestimentoGestorFundo | null> {
    const fundoInvestimentoGestorFundo =
      await this.prisma.fundo_investimento_gestor_fundo.findUnique({
        where: { id },
      });

    return fundoInvestimentoGestorFundo;
  }

  async buscarPorFundoEGestor(idFundo: number, idGestor: number) {
    return this.prisma.fundo_investimento_gestor_fundo.findMany({
      where: { id_fundo_investimento: idFundo, id_gestor_fundo: idGestor },
    });
  }

  async remover(id: number) {
    await this.prisma.fundo_investimento_gestor_fundo.delete({
      where: { id },
    });
  }

  async encontrarPorFundo(
    idFundo: number,
  ): Promise<FundoInvestimentoGestorFundo | null> {
    return this.prisma.fundo_investimento_gestor_fundo.findFirst({
      where: { id_fundo_investimento: idFundo },
    });
  }
}
