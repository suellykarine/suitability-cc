import { Repositorio } from './repositorio';
import {
  AdministradorFundo,
  AdministradorFundoSemVinculo,
} from 'src/@types/entities/fundos';

export abstract class AdministradorFundoRepositorio extends Repositorio {
  abstract encontrarPorEmail(email: string): Promise<AdministradorFundo | null>;
  abstract criar(
    data: Omit<AdministradorFundoSemVinculo, 'id'>,
  ): Promise<AdministradorFundo>;

  abstract atualizar(
    id: number,
    data: Partial<AdministradorFundoSemVinculo>,
  ): Promise<AdministradorFundo>;

  abstract remover(id: number): Promise<void>;
}
