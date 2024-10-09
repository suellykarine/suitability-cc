import { Endereco } from './endereco';
import { ProcuradorFundoFundoInvestimento } from './procuradorFundoFundoInvestimento';

export type ProcuradorFundo = {
  id: number;
  nome?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  id_endereco?: number;
  endereco?: Endereco;
  procurador_fundo_fundo_investimento?: ProcuradorFundoFundoInvestimento[];
};
