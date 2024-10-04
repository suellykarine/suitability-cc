import { status_usuario } from '@prisma/client';

export abstract class StatusUsuarioRepositorio {
  abstract encontrarPorNome(nome: string): Promise<status_usuario | null>;
}
