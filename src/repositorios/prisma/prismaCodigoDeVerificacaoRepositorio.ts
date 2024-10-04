import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CodigoVerificacaoRepositorio } from '../contratos/codigoDeVerificacaoRepositorio';

@Injectable()
export class PrismaCodigoVerificacaoRepositorio
  implements CodigoVerificacaoRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  async encontrarPorEmail(email: string): Promise<any | null> {
    return this.prisma.codigo_verificacao.findFirst({
      where: { email },
    });
  }

  async atualizar(id: number, codigo: string): Promise<void> {
    await this.prisma.codigo_verificacao.update({
      where: { id },
      data: { codigo },
    });
  }

  async criar(
    email: string,
    codigo: string,
    dataExpiracao: Date,
  ): Promise<void> {
    await this.prisma.codigo_verificacao.create({
      data: {
        email,
        codigo,
        data_expiracao: dataExpiracao,
      },
    });
  }
}
