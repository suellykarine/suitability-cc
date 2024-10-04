import { tipo_usuario } from '@prisma/client';

export abstract class TipoUsuarioRepositorio {
  abstract encontrarPorTipo(tipo: string): Promise<tipo_usuario | null>;
}
