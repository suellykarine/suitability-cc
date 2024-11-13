import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { DocumentoRepositorio } from '../contratos/documentoRepositorio';
import { Documento } from 'src/@types/entities/documento';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaDocumentoRepositorio implements DocumentoRepositorio {
  constructor(private prisma: PrismaService) {}

  definirContextoDaTransacao(contexto: Prisma.TransactionClient): void {
    this.prisma = contexto as PrismaService;
  }

  removerContextoDaTransacao(): void {
    this.prisma = new PrismaService();
  }

  async buscarPorId(idDocumento: number): Promise<Documento | null> {
    return this.prisma.documento.findFirst({
      where: { id: idDocumento },
    });
  }

  async atualizarDocumento(
    idDocumento: number,
    dadosDocumento: Partial<
      Omit<
        Documento,
        | 'fundo_investimento'
        | 'gestor_fundo'
        | 'status_documento'
        | 'usuario'
        | 'feedback_backoffice'
      >
    >,
  ): Promise<Documento | null> {
    return this.prisma.documento.update({
      where: { id: idDocumento },
      data: { ...dadosDocumento },
    });
  }
}
