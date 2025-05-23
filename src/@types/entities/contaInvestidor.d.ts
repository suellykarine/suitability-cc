import { DebentureSerieInvestidor } from './debenture';
import { FundoInvestimento } from './fundos';

export type ContaInvestidorSemVinculos = {
  id: number;
  id_fundo_investidor?: number;
  identificador_favorecido: string;
  nome_favorecido: string;
  agencia: string;
  agencia_digito?: string;
  codigo_banco: string;
  conta: string;
  conta_digito?: string;
  codigo_conta: string;
};

export type ContaInvestidor = ContaInvestidorSemVinculos & {
  fundo_investimento?: FundoInvestimento;
  debenture_serie_investidor?: DebentureSerieInvestidor[];
};
