export type ContaCorrentePagadora = {
  id: number;
  agencia: string;
  conta: string;
  nomeCorrentista: string;
  banco: {
    codigo: number;
    nome: string;
  };
  fundo: {
    sigla: string;
    identificador: string;
  };
};

export type Cedente = {
  nome: string;
  identificador: string;
  razaoSocial: string;
};

export type Recebivel = {
  id: number;
  valorOriginal: number;
  valorPresente: number;
  valorFuturo: number;
  dataLiquidacao: string;
  dataVencimento: string;
};

export type AtivoInvest = {
  codigoAtivo: number;
  codigoOperacao: number;
  valorPresente: number;
  valorFuturo: number;
  tipoAtivo: string;
  tir: number;
  tirAnual: number;
  taxaAtivo: string;
  cdiInvestPercentual: number;
  spread: number;
  codigoCedulaCreditoBancario: string;
  cedente: Cedente;
  sacado: Cedente;
  recebiveis: Recebivel[];
};

export type OperacaoInvest = {
  codigoOperacao: number;
  dataOperacao: string;
  dataAssinaturaDigital: string;
  valorBruto: number;
  valorLiquido: number;
  complementoStatusOperacao: string;
  codigoControleParceiro: string;
  statusOperacao: string;
  produtoSigla: string;
  empresaChave: string;
  fundoSigla: string;
  fundoNome: string;
  contaCorrentePagadora: ContaCorrentePagadora;
  cedente: Cedente;
  ativosInvest: AtivoInvest[];
};

export type ControleOperacao = {
  tipoOperacaoPagamento: string;
  codigoOperacaoPagamento: number;
  codigoContaCedente: number;
  codigoOperacao: number;
  valorPagamento: number;
  conta: string;
  identificadorFavorecido: string;
  nomeFavorecido: string;
  codigoBanco: number;
  tipoConta: string;
  metodoPagamento: string;
  agencia: string;
  contaDigito: string;
};
