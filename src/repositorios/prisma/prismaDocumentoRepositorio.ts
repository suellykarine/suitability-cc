import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { DocumentoRepositorio } from '../contratos/documentoRepositorio';
import { Documento, DocumentoSemVinculo } from 'src/@types/entities/documento';
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

  async criar({
    id_fundo_investimento,
    id_gestor_fundo,
    id_status_documento,
    id_usuario,
    ...dados
  }: Omit<DocumentoSemVinculo, 'id'>): Promise<Documento> {
    return this.prisma.documento.create({
      data: {
        ...dados,

        ...(id_fundo_investimento && {
          fundo_investimento: {
            connect: { id: id_fundo_investimento },
          },
        }),
        ...(id_gestor_fundo && {
          gestor_fundo: {
            connect: { id: id_gestor_fundo },
          },
        }),
        ...(id_status_documento && {
          status_documento: {
            connect: { id: id_status_documento },
          },
        }),
        ...(id_usuario && {
          usuario: {
            connect: { id: id_usuario },
          },
        }),
      },
    });
  }

  async atualizarDocumento(
    idDocumento: number,
    {
      id_fundo_investimento,
      id_gestor_fundo,
      id_status_documento,
      id_usuario,
      ...dados
    }: Partial<Omit<DocumentoSemVinculo, 'id'>>,
  ): Promise<Documento | null> {
    return this.prisma.documento.update({
      where: { id: idDocumento },
      data: {
        ...dados,

        ...(id_fundo_investimento && {
          fundo_investimento: {
            connect: { id: id_fundo_investimento },
          },
        }),
        ...(id_gestor_fundo && {
          gestor_fundo: {
            connect: { id: id_gestor_fundo },
          },
        }),
        ...(id_status_documento && {
          status_documento: {
            connect: { id: id_status_documento },
          },
        }),
        ...(id_usuario && {
          usuario: {
            connect: { id: id_usuario },
          },
        }),
      },
    });
  }

  async removerPorFundo(idFundo: number): Promise<void> {
    await this.prisma.documento.deleteMany({
      where: { id_fundo_investimento: idFundo },
    });
  }
}
