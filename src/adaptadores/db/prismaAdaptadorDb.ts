import { Injectable } from '@nestjs/common';
import { AdaptadorDb } from './adaptadorDb';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PrismaAdaptadorDb implements AdaptadorDb {
  constructor(private prismaService: PrismaService) {}

  async fazerTransacao<T>(
    operacao: (sessao: Prisma.TransactionClient) => Promise<T>,
    config: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<T> {
    return await this.prismaService.$transaction(operacao, config);
  }
}
