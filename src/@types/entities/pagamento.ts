// Tipos de Operação
type TipoOperacaoPagamentoPix = 'OperacaoPagamentoPixChave';
type TipoOperacaoPagamentoConta = 'OperacaoPagamentoConta';

type TipoChavePix = 'CPF' | 'CNPJ' | 'TELEFONE' | 'EMAIL';
type TipoPagamentoConta = 'TED' | 'PIX';
type TipoConta = 'CORRENTE' | 'PAGAMENTO';

type PagamentoOperacaoBase = {
  codigoOperacaoPagamento: number;
  codigoContaCedente: number;
  codigoOperacao: number;
  valorPagamento: number;
};

type PagamentoOperacaoPix = PagamentoOperacaoBase & {
  tipoOperacaoPagamento: TipoOperacaoPagamentoPix;
  tipoChavePix: TipoChavePix;
  chavePix: string;
};

type PagamentoOperacaoConta = PagamentoOperacaoBase & {
  tipoOperacaoPagamento: TipoOperacaoPagamentoConta;
  tipoPagamento: TipoPagamentoConta;
  agencia: string;
  agenciaDigito?: string;
  conta: string;
  contaDigito: string;
  identificadorFavorecido: string;
  nomeFavorecido: string;
  codigoBanco: number;
  tipoConta: TipoConta;
};
