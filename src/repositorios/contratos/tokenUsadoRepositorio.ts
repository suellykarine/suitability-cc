import { Prisma } from '@prisma/client';
import { Repositorio } from './repositorio';

export abstract class TokenUsadoRepositorio extends Repositorio {
  abstract criar(
    token: string,
    dataCriacao: Date,
    prisma?: Prisma.TransactionClient,
  ): Promise<void>;
}
