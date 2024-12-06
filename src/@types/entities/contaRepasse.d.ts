import { FundoInvestimento } from './fundos';

export type ContaRepasseSemVinculo = {
  id: number;
  codigo_banco?: string;
  agencia?: string;
  conta_bancaria?: string;
  id_fundo_investimento?: number;
};

export type ContaRepasse = ContaRepasseSemVinculo & {
  fundo_investimento?: FundoInvestimento;
};
