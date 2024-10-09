import { FundoInvestimento } from './fundos';

export type ContaRepasse = {
  id: number;
  codigo_banco?: string;
  agencia?: string;
  conta_bancaria?: string;
  id_fundo_investimento?: number;
  fundo_investimento?: FundoInvestimento;
};
