import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { FundoInvestimentoRepositorio } from '../contratos/fundoInvestimentoRepositorio';
import { converterCamposDecimais } from 'src/utils/prisma/functions';
import {
  FundoInvestimento,
  FundoInvestimentoSemVinculos,
} from 'src/@types/entities/fundos';
import { Prisma } from '@prisma/client';
import { AtualizarFundoInvestimentoAptoDebenture } from 'src/@types/entities/debenture';

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

  async atualizar(
    id: FundoInvestimento['id'],
    {
      id_administrador_fundo,
      id_fundo_backoffice,
      id_representante_fundo,
      id_status_fundo_investimento,
      ...dados
    }: Partial<Omit<FundoInvestimentoSemVinculos, 'id'>>,
  ): Promise<FundoInvestimento> {
    const fundo = await this.prisma.fundo_investimento.update({
      where: { id },
      data: {
        ...dados,
        ...(id_administrador_fundo && {
          administrador_fundo: { connect: { id: id_administrador_fundo } },
        }),
        ...(id_fundo_backoffice && {
          fundo_backoffice: { connect: { id: id_fundo_backoffice } },
        }),
        ...(id_representante_fundo && {
          representante_fundo: { connect: { id: id_representante_fundo } },
        }),
        ...(id_status_fundo_investimento && {
          status_fundo_investimento: {
            connect: { id: id_status_fundo_investimento },
          },
        }),
      },
    });
    return converterCamposDecimais(fundo);
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

  async atualizaAptoDebentureEvalorSerie({
    apto_debenture,
    valor_serie_debenture,
    id_fundo,
  }: AtualizarFundoInvestimentoAptoDebenture): Promise<FundoInvestimento> {
    const atualizaFundo = await this.prisma.fundo_investimento.update({
      where: { id: id_fundo },
      data: { apto_debenture, valor_serie_debenture },
    });

    return converterCamposDecimais(atualizaFundo);
  }
  async buscarEstaAptoADebentureRepositorio(id: number): Promise<boolean> {
    const investidor = await this.prisma.fundo_investimento.findUnique({
      where: { id },
      select: {
        apto_debenture: true,
        valor_serie_debenture: true,
      },
    });

    if (!investidor) {
      return false;
    }

    if (!investidor.apto_debenture) {
      return false;
    }

    if (!investidor.valor_serie_debenture) {
      return false;
    }

    return true;
  }
}
