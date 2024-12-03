import { Endereco } from 'src/@types/entities/endereco';

export abstract class EnderecoRepositorio {
  abstract atualizar(
    id: number,
    dadosAtualizados: Partial<Endereco>,
  ): Promise<Endereco | null>;

  abstract buscarPorId(id: number): Promise<Endereco | null>;
}
