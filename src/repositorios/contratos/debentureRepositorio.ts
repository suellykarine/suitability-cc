import { debenture } from '@prisma/client';

export abstract class DebentureRepositorio {
  abstract encontrarPorId(id: number): Promise<debenture | null>;
}
