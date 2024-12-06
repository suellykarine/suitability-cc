import { Repositorio } from 'src/repositorios/contratos/repositorio';

export abstract class AdaptadorDb {
  abstract fazerTransacao<T>(
    operacao: (contexto: unknown) => Promise<T>,
    repositorios: Repositorio[],
    config?: any,
  ): Promise<T>;
}
