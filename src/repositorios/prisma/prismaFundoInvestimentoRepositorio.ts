import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { FundoInvestimentoRepositorio } from '../contratos/fundoInvestimentoRepositorio';
import { converterCamposDecimais } from 'src/utils/prisma/functions';
import { FundoInvestimento } from 'src/@types/entities/fundos';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaFundoInvestimentoRepositorio
  implements FundoInvestimentoRepositorio
{
  constructor(private prisma: PrismaService) {}
  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }
  async encontrarPorId(id: number): Promise<FundoInvestimento | null> {
    const fundoDados = await this.prisma.fundo_investimento.findUnique({
      where: { id },
      include: {
        administrador_fundo: {
          include: {
            endereco: true,
          },
        },
        fundo_investimento_gestor_fundo: {
          include: {
            usuario_fundo_investimento: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });
    return converterCamposDecimais(fundoDados);
  }

  async encontrarPorCpfCnpj(cpfCnpj: string) {
    const fundo = await this.prisma.fundo_investimento.findUnique({
      where: {
        cpf_cnpj: cpfCnpj,
      },
    });
    return converterCamposDecimais(fundo);
  }
  async encontrarComRelacionamentos(id: number): Promise<FundoInvestimento> {
    const fundo = await this.prisma.fundo_investimento.findUnique({
      where: { id },
      include: {
        debenture_serie_investidor: {
          include: {
            debenture_serie: { include: { debenture: true } },
            conta_investidor: true,
          },
        },
        representante_fundo: true,
      },
    });
    return converterCamposDecimais(fundo);
  }
}
