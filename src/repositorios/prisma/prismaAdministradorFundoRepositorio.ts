import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  FundoBackoffice,
  FundoBackofficeSemVinculo,
} from 'src/@types/entities/backoffice';
import { Prisma } from '@prisma/client';
import { AdministradorFundoRepositorio } from '../contratos/admininstradorFundoRepositorio';
import {
  AdministradorFundo,
  AdministradorFundoSemVinculo,
} from 'src/@types/entities/fundos';

@Injectable()
export class PrismaAdministradorFundoRepositorio
  implements AdministradorFundoRepositorio
{
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }

  async encontrarPorEmail(email: string): Promise<AdministradorFundo | null> {
    const administradorFundo = await this.prisma.administrador_fundo.findUnique(
      {
        where: {
          email,
        },
      },
    );
    return administradorFundo;
  }

  async criar(
    data: Omit<AdministradorFundoSemVinculo, 'id'>,
  ): Promise<AdministradorFundoSemVinculo | null> {
    const administradorFundo = await this.prisma.administrador_fundo.create({
      data,
    });

    return administradorFundo;
  }

  async atualizar(
    id: number,
    data: Partial<AdministradorFundoSemVinculo>,
  ): Promise<AdministradorFundo> {
    return await this.prisma.administrador_fundo.update({
      where: { id },
      data,
    });
  }

  async remover(id: number): Promise<void> {
    await this.prisma.administrador_fundo.delete({
      where: { id },
    });
  }
}
