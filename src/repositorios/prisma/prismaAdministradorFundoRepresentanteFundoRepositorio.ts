import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AdministradorFundoRepresentanteFundoRepositorio } from '../contratos/administradorFundoRepresentanteFundoRepositorio';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaAdministradorFundoRepresentanteFundoRepositorio
  implements AdministradorFundoRepresentanteFundoRepositorio
{
  constructor(private prisma: PrismaService) {}
  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }
  async criarVinculoAdministradorRepresentante(
    idAdministradorFundo: number,
    idRepresentanteFundo: number,
  ): Promise<void> {
    await this.prisma.administrador_fundo_representante_fundo.create({
      data: {
        id_administrador_fundo: idAdministradorFundo,
        id_representante_fundo: idRepresentanteFundo,
      },
    });
  }

  async verificarVinculoAdministradorRepresentante(
    idAdministradorFundo: number,
    idRepresentanteFundo: number,
  ): Promise<boolean> {
    const vinculo =
      await this.prisma.administrador_fundo_representante_fundo.findFirst({
        where: {
          id_administrador_fundo: idAdministradorFundo,
          id_representante_fundo: idRepresentanteFundo,
        },
      });
    return !!vinculo;
  }

  async buscarPorAdministradorERepresentante(
    idAdministrador: number,
    idRepresentante: number,
  ): Promise<any> {
    return this.prisma.administrador_fundo_representante_fundo.findFirst({
      where: {
        id_administrador_fundo: idAdministrador,
        id_representante_fundo: idRepresentante,
      },
    });
  }

  async remover(id: number): Promise<void> {
    await this.prisma.administrador_fundo_representante_fundo.delete({
      where: { id },
    });
  }
}
