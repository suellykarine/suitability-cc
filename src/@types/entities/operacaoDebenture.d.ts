export type CriarOperacaoDebenture = {
  id_debenture_serie_investidor: number;
  codigo_operacao: string;
  status_retorno_creditsec: string;
  mensagem_retorno_creditsec?: string;
  data_exclusao?: Date;
  data_inclusao: Date;
};
