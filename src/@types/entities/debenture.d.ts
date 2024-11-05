import { ContaInvestidor } from './contaInvestidor';
import { FundoInvestimento } from './fundos';

export type Debenture = {
  id: number;
  numero_debenture: number;
  nome_debenture: string;
  valor_debenture: number;
  data_emissao: Date;
  data_vencimento: Date;
  debenture_serie?: DebentureSerie[];
};

export type DebentureSerie = {
  id: number;
  id_debenture: number;
  numero_serie: number;
  valor_serie: number;
  valor_serie_investido: number;
  valor_serie_restante?: number;
  data_emissao?: Date;
  data_vencimento?: Date;
  debenture?: Debenture;
};

export type DebentureSerieInvestidor = {
  id: number;
  id_debenture_serie: number;
  id_conta_investidor: number;
  id_fundo_investimento?: number;
  data_vinculo?: Date;
  data_desvinculo?: Date;
  data_encerramento?: Date;
  codigo_investidor_laqus?: string;
  status_retorno_laqus?: string;
  mensagem_retorno_laqus?: string;
  status_retorno_creditsec?: string;
  mensagem_retorno_creditsec?: string;
  conta_investidor?: ContaInvestidor;
  debenture_serie?: DebentureSerie;
  fundo_investimento?: FundoInvestimento;
};

export type AtualizarFundoInvestimentoAptoDebenture = {
  apto_debenture: boolean;
  valor_serie_debenture: number | null;
  id_fundo: number;
};
export type AtualizaDebentureSerieInvestidorCreditSec = {
  id_debenture_serie_investidor: number;
  status: string;
  motivo: string | null;
  data_desvinculo: Date | null;
};

export type AtualizarDebentureSerieInvestidorLaqus = {
  statusRetornoLaqus: StatusRetornoLaqus;
  mensagemRetornoLaqus: string;
  idFundoInvestimento: number;
  dataDesvinculo?: Date;
};

export type atualizarDatasDebentureSerie = {
  data_emissao: Date;
  data_vencimento: Date;
  id_debenture_serie: number;
};
export type StatusRetornoLaqus = 'Pendente' | 'Reprovado' | 'Aprovado';

type AtualizarValorSerie = {
  idDebentureSerie: number;
  valorSerie: number;
};
