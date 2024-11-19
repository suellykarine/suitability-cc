import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, operacao_debenture } from '@prisma/client';
import { OperacaoDebentureRepositorio } from '../contratos/operacaoDebentureRepositorio';
import { CriarOperacaoDebenture } from 'src/@types/entities/operacaoDebenture';

@Injectable()
export class PrismaOperacaoDebentureRepositorio
  implements OperacaoDebentureRepositorio
{
  constructor(private prisma: PrismaService) {}

  async criar(data: CriarOperacaoDebenture): Promise<operacao_debenture> {
    return await this.prisma.operacao_debenture.create({
      data,
    });
  }

  async atualizar(
    data: Partial<CriarOperacaoDebenture>,
    id: number,
  ): Promise<operacao_debenture> {
    return await this.prisma.operacao_debenture.update({ where: { id }, data });
  }

  async buscarOperacoesPeloCodigoOperacao(
    codigo_operacao: string,
  ): Promise<operacao_debenture[]> {
    return await this.prisma.operacao_debenture.findMany({
      where: { codigo_operacao },
    });
  }

  async buscarOperacoesPeloStatusCreditSec(
    statusCreditSec: string,
  ): Promise<operacao_debenture[]> {
    return await this.prisma.operacao_debenture.findMany({
      where: { status_retorno_creditsec: statusCreditSec },
    });
  }
}
