import { ProcuradorFundo } from 'src/@types/entities/fundos';

export abstract class ProcuradorFundoRepositorio {
  abstract atualizar(
    id: number,
    dadosAtualizados: Partial<ProcuradorFundo>,
  ): Promise<ProcuradorFundo | null>;

  abstract buscarProcuradorPorCpf(cpf: string): Promise<ProcuradorFundo | null>;
}
