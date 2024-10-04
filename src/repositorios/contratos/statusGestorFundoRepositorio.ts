import { status_gestor_fundo } from '@prisma/client';

export abstract class StatusGestorFundoRepositorio {
  abstract encontrarPorNome(nome: string): Promise<status_gestor_fundo | null>;
}
