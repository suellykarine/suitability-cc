import { Prisma, gestor_fundo } from '@prisma/client';
import { Repositorio } from './repositorio';

export abstract class GestorFundoRepositorio extends Repositorio {
  abstract encontrarPorCnpj(cnpj: string): Promise<gestor_fundo | null>;
  abstract criar(
    data: any,
    prisma?: Prisma.TransactionClient,
  ): Promise<gestor_fundo>;
}
