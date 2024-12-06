import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import {
  ProcuradorFundo,
  ProcuradorFundoSemVinculo,
} from 'src/@types/entities/fundos';
import { ProcuradorFundoRepositorio } from 'src/repositorios/contratos/procuradorFundoRepositorio';

@Injectable()
export class PrismaProcuradorFundoRepositorio
  implements ProcuradorFundoRepositorio
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
    dadosAtualizados: Partial<Omit<ProcuradorFundo, 'id'>>,
  ): Promise<ProcuradorFundo | null> {
    const {
      id_endereco,
      procurador_fundo_fundo_investimento,
      ...restoDosDados
    } = dadosAtualizados;

    return await this.prisma.procurador_fundo.update({
      where: { id },
      data: {
        ...restoDosDados,
        endereco: id_endereco
          ? {
              connect: { id: id_endereco },
            }
          : undefined,
        procurador_fundo_fundo_investimento: procurador_fundo_fundo_investimento
          ? {
              set: procurador_fundo_fundo_investimento.map((item) => ({
                id: item.id,
              })),
            }
          : undefined,
      },
    });
  }

  async buscarProcuradorPorCpf(cpf: string): Promise<ProcuradorFundo | null> {
    return await this.prisma.procurador_fundo.findUnique({
      where: { cpf },
      include: {
        endereco: true,
      },
    });
  }

  async encontrarPorCpf(cpf: string): Promise<ProcuradorFundo | null> {
    return this.prisma.procurador_fundo.findFirst({
      where: { cpf },
    });
  }

  async criar(
    data: Omit<ProcuradorFundoSemVinculo, 'id'>,
  ): Promise<ProcuradorFundo> {
    return this.prisma.procurador_fundo.create({ data });
  }

  async buscarProcuradorPorFundo(idFundo: number) {
    return this.prisma.procurador_fundo.findFirst({
      where: {
        procurador_fundo_fundo_investimento: {
          some: { id_fundo_investimento: idFundo },
        },
      },
    });
  }

  async remover(id: number): Promise<void> {
    await this.prisma.procurador_fundo.delete({
      where: { id },
    });
  }
}
