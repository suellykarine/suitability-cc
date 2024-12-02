export abstract class AdaptadorDb {
  abstract fazerTransacao<T>(
    operacao: (contexto: unknown) => Promise<T>,
    config?: any,
  ): Promise<T>;
}
