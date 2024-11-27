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

type Recebiveis = {
  codigoRecebivel: number;
  valorOriginal: number;
  valorPresente: number;
  valorFuturo: number;
  dataVencimento: string;
};
type Cedente = {
  identificador: string;
  nome: string;
};
export type AtivosInvest = {
  codigoAtivo: number;
  tipoAtivo: string;
  dataEmissaoAtivo: string;
  valorPresente: number;
  valorFuturo: number;
  spread: number;
  tir: number;
  tirAnual: number;
  taxaAtivo: string;
  cdiInvestPercentual: number;
  codigoCedulaCreditoBancario: string;
  cedente: Cedente;
  sacado: {
    identificador: string;
    nome: string;
  };
  recebiveis: Recebiveis[];
};
