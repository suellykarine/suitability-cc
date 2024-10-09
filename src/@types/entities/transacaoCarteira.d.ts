import { CarteiraInvestimento } from './carteiraInvestimento';
import { ModalidadeInvestimento } from './modalidadeInvestimento';
import { Usuario } from './usuario';

export type TransacaoCarteira = {
  id: number;
  data_transacao: Date;
  valor_total?: number;
  id_modalidade_investimento: number;
  id_status_transacao_carteira?: number;
  id_usuario?: number;
  carteira_investimento?: CarteiraInvestimento[];
  modalidade_investimento: ModalidadeInvestimento;
  status_transacao?: StatusTransacaoCarteira;
  usuario?: Usuario;
};

export type StatusTransacaoCarteira = {
  id: number;
  nome: string;
  descricao: string;
  transacao_carteira?: TransacaoCarteira[];
};
