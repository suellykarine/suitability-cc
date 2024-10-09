import { AtivoInvestido } from './ativoInvestido';
import { FundoInvestimento } from './fundos';
import { TransacaoCarteira } from './transacaoCarteira';

export type CarteiraInvestimento = {
  id: number;
  id_fundo_investimento?: number;
  id_transacao_carteira?: number;
  nome_carteira: string;
  valor_total?: number;
  id_status_carteira_investimento?: number;
  data_criacao?: Date;
  ativo_investido?: AtivoInvestido[];
  fundo_investimento?: FundoInvestimento;
  status_carteira_investimento?: StatusCarteiraInvestimento;
  transacao_carteira?: TransacaoCarteira;
};

export type StatusCarteiraInvestimento = {
  id: number;
  nome: string;
  descricao: string;
  carteira_investimento?: CarteiraInvestimento[];
};
