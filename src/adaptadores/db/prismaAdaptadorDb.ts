import { Injectable } from '@nestjs/common';
import { AdaptadorDb } from './adaptadorDb';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { Repositorio } from 'src/repositorios/contratos/repositorio';
import {
  definirContextosDeTransacao,
  removerContextosDeTransacao,
} from 'src/utils/funcoes/repositorios';

@Injectable()
export class PrismaAdaptadorDb implements AdaptadorDb {
  constructor(private prismaService: PrismaService) {}

  async fazerTransacao<T>(
    operacao: (sessao: Prisma.TransactionClient) => Promise<T>,
    repositorios: Repositorio[],
    config?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<T> {
    return await this.prismaService.$transaction(
      async (session) => {
        try {
          definirContextosDeTransacao({ repositorios, contexto: session });
          const resultado = await operacao(session);
          return resultado;
        } catch (error) {
          throw error;
        } finally {
          removerContextosDeTransacao({ repositorios });
        }
      },
      {
        timeout: 30000,
        maxWait: 5000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        ...config,
      },
    );
  }
}
