export interface Active {
  id: number;
  categoria: string;
  status: string;
  valorPresente: number;
  valorFuturo: number;
  tir: number;
  dataPrimeiroVencimento: string;
  dataUltimoVencimento: string;
  percentualParcelasPagas: number;
  qtdParcelasTotal: number;
  qtdParcelasPagas: number;
  qtdParcelasDisponiveis: number;
  recebiveis: [{ id: number }];
  cedente: { nome: string; identificacao: string; scoreInterno: string };
  sacado: { nome: string; identificacao: string };
  garantia: { tipo: string; percentual: number };
  produto: { sigla: string };
  fundo: { sigla: string };
}
