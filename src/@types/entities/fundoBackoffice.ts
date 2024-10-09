import { FundoInvestimento } from './fundos';

export type FundoBackoffice = {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  fundo_investimento?: FundoInvestimento[];
};
