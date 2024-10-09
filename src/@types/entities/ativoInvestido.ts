import { CarteiraInvestimento } from './carteiraInvestimento';

export type AtivoInvestido = {
  id: number;
  id_carteira_investimento?: number;
  nome_ativo?: string;
  valor_investimento?: number;
  taxa_retorno?: number;
  segmento?: string;
  categoria?: string;
  cnpj?: string;
  nome_empresa?: string;
  taxa_rendimento?: number;
  taxa_valorizacao?: number;
  numero_documento?: string;
  valor_presente?: number;
  valor_futuro?: number;
  valor_investido?: number;
  data_vencimento?: Date;
  status_ativo?: string;
  score_interno?: string;
  data_criacao?: Date;
  carteira_investimento?: CarteiraInvestimento;
};
