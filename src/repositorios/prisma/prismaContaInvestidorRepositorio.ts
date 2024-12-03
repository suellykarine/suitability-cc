import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ContaInvestidorRepositorio } from '../contratos/contaInvestidorRespositorio';
import { ContaInvestidor } from 'src/@types/entities/contaInvestidor';
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

  async atualizarContaInvestidorFundoInvestimento(
    idFundoInvestimento: number,
    idContaInvestidor: number,
  ): Promise<ContaInvestidor | null> {
    return await this.prisma.conta_investidor.update({
      where: { id: idContaInvestidor },
      data: { fundo_investimento: { connect: { id: idFundoInvestimento } } },
    });
  }

  async criarContaInvestidor(
    dados: Omit<ContaInvestidor, 'id' | 'fundo_investimento'>,
  ): Promise<ContaInvestidor> {
    const { id_fundo_investidor, debenture_serie_investidor, ...restoDados } =
      dados;


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
