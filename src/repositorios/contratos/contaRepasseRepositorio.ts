import {
  ContaRepasse,
  ContaRepasseSemVinculo,
} from 'src/@types/entities/contaRepasse';
import { Repositorio } from './repositorio';

export abstract class ContaRepasseRepositorio extends Repositorio {
  abstract criar(
    data: Omit<ContaRepasseSemVinculo, 'id'>,
  ): Promise<ContaRepasse>;

  abstract encontrarPorId(id: number): Promise<ContaRepasse | null>;
  abstract atualizar(
    idFundo: number,
    data: Partial<ContaRepasseSemVinculo>,
  ): Promise<ContaRepasse>;

  abstract removerPorFundo(idFundo: number): Promise<void>;
}
