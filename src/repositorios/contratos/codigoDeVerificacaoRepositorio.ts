export abstract class CodigoVerificacaoRepositorio {
  abstract encontrarPorEmail(email: string): Promise<any | null>;
  abstract atualizar(id: number, codigo: string): Promise<void>;
  abstract criar(
    email: string,
    codigo: string,
    dataExpiracao: Date,
  ): Promise<void>;
}
