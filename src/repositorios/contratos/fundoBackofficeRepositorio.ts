import { Repositorio } from './repositorio';
import {
  FundoBackoffice,
  FundoBackofficeSemVinculo,
} from 'src/@types/entities/backoffice';

export abstract class FundoBackofficeRepositorio extends Repositorio {
  abstract encontrarPorEmail(email: string): Promise<FundoBackoffice | null>;
  abstract criar(data: Omit<FundoBackoffice, 'id'>): Promise<FundoBackoffice>;
  abstract atualizar(
    id: number,
    data: Partial<FundoBackofficeSemVinculo>,
  ): Promise<FundoBackoffice>;

  abstract remover(id: number): Promise<void>;
}
