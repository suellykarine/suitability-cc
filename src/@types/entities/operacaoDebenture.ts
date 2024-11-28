import { DebentureSerieInvestidor } from './debenture';

export type OperacaoDebenture = {
  id: number;
  id_debenture_serie_investidor: number;
  codigo_operacao: number;
  status_retorno_creditsec: string;
  mensagem_retorno_creditsec?: string | null;
  data_inclusao: Date;
  data_exclusao?: Date | null;
  debenture_serie_investidor?: DebentureSerieInvestidor;
};
