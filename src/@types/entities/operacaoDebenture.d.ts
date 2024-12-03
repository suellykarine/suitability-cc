import { DebentureSerieInvestidor } from './debenture';

export type OperacaoDebentureSemVinculo = {
  id: number;
  id_debenture_serie_investidor: number;
  codigo_operacao: number;
  status_retorno_creditsec: string;
  mensagem_retorno_creditsec?: string | null;
  data_inclusao: Date;
  data_exclusao?: Date | null;
};

export type OperacaoDebenture = OperacaoDebentureSemVinculo & {
  debenture_serie_investidor?: DebentureSerieInvestidor;
};
