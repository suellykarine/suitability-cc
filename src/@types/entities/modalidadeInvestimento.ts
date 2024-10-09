import { TransacaoCarteira } from './transacaoCarteira';

export type ModalidadeInvestimento = {
  id: number;
  chave: string;
  nome: string;
  descricao: string;
  transacao_carteira?: TransacaoCarteira[];
};
