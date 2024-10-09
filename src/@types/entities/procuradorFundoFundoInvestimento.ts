import { FundoInvestimento } from './fundos';
import { ProcuradorFundo } from './procuradorFundo';

export type ProcuradorFundoFundoInvestimento = {
  id: number;
  id_fundo_investimento: number;
  id_procurador_fundo: number;
  fundo_investimento: FundoInvestimento;
  procurador_fundo: ProcuradorFundo;
};
