import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RepresentanteFundoRepositorio } from '../contratos/representanteFundoRepositorio';
import {
  RepresentanteFundo,
  RepresentanteFundoSemVinculo,
} from 'src/@types/entities/fundos';

@Injectable()
export class PrismaRepresentanteFundoRepositorio
  implements RepresentanteFundoRepositorio
{
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }

  async encontrarPorContato(
    cpf?: string,
    telefone?: string,
    email?: string,
  ): Promise<RepresentanteFundo | null> {
    return this.prisma.representante_fundo.findFirst({
      where: {
        OR: [{ cpf }, { telefone }, { email }].filter(
          (condicao) => Object.values(condicao)[0] !== undefined,
        ),
      },
      include: {
        administrador_fundo_representante_fundo: true,
      },
    });
  }

  async criarRepresentante(
    data: Omit<RepresentanteFundoSemVinculo, 'id'>,
  ): Promise<RepresentanteFundo> {
    return this.prisma.representante_fundo.create({
      data,
    });
  }

  async atualizar(
    id: number,
    data: Partial<RepresentanteFundoSemVinculo>,
  ): Promise<RepresentanteFundo> {
    return await this.prisma.representante_fundo.update({
      where: { id },
      data,
    });
  }

  async remover(id: number): Promise<void> {
    await this.prisma.representante_fundo.delete({
      where: { id },
    });
  }
}
