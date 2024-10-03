import { carta_convite } from '@prisma/client';

export abstract class CartaConviteRepositorio {
  abstract encontrarPorIdEAprovado(id: number): Promise<carta_convite | null>;
}
