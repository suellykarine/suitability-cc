import { ProcuradorFundo } from 'src/@types/entities/fundos';
import { Repositorio } from './repositorio';

export abstract class ProcuradorFundoRepositorio extends Repositorio {
  abstract atualizar(
    id: number,
    dadosAtualizados: Partial<ProcuradorFundo>,
  ): Promise<ProcuradorFundo | null>;

  abstract buscarProcuradorPorCpf(cpf: string): Promise<ProcuradorFundo | null>;

  abstract buscarProcuradorPorFundo(idFundo: number): Promise<ProcuradorFundo>;
  abstract remover(id: number): Promise<void>;

  abstract encontrarPorCpf(cpf: string): Promise<ProcuradorFundo | null>;
  abstract criar(data: Omit<ProcuradorFundo, 'id'>): Promise<ProcuradorFundo>;
}
