import { PrismaService } from 'prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ContaInvestidorRepositorio } from '../contratos/contaInvestidorRespositorio';
import { ContaInvestidor } from 'src/@types/entities/contaInvestidor';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaContaInvestidorRepositorio
  implements ContaInvestidorRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  async atualizarContaInvestidorFundoInvestimento(
    idFundoInvestimento: number,
    idContaInvestidor: number,
  ): Promise<ContaInvestidor | null> {
    console.log(idFundoInvestimento);
    console.log(idContaInvestidor);
    return await this.prisma.conta_investidor.update({
      where: { id: idContaInvestidor },
      data: { fundo_investimento: { connect: { id: idFundoInvestimento } } },
    });
  }
}
