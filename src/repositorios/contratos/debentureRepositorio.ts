import { Debenture } from 'src/@types/entities/debenture';

export abstract class DebentureRepositorio {
  abstract encontrarPorId(id: number): Promise<Debenture | null>;

  abstract criarDebenture(
    data: Omit<Debenture, 'id' | 'debenture_serie'>,
  ): Promise<Debenture>;

  abstract listarDebentures(): Promise<Debenture[]>;

  abstract buscarPorNome(nome: string): Promise<Debenture>;

  abstract buscarPorNumero(numero: number): Promise<Debenture>;
}
