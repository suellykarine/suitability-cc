import { DebentureSerie } from 'src/@types/entities/debenture';
type EhValidarPorData = {
  serie: DebentureSerie;
  dataDeCorte: Date;
};
type EhValidarPorValorProps = {
  serie: DebentureSerie;
  valorEntrada: number;
};
type PertenceADebentureAtualProps = {
  serie: DebentureSerie;
  debentureId: number;
};
type EncontrarSerieComValorAproximadoProps = {
  series: DebentureSerie[];
  valorEntrada: number;
};
type FiltrarSeriesPorValorProps = {
  series: DebentureSerie[];
  valorEntrada: number;
};

export function calcularDataDeCorte(meses: number): Date {
  const data = new Date();
  data.setMonth(data.getMonth() + meses);
  return data;
}

export function ehValidaPorData({
  serie,
  dataDeCorte,
}: EhValidarPorData): boolean {
  const dataVencimento = new Date(serie.data_vencimento);
  return dataVencimento > dataDeCorte;
}

export function pertenceADebentureAtual({
  serie,
  debentureId,
}: PertenceADebentureAtualProps): boolean {
  return serie.id_debenture === debentureId;
}

export function ehValidaPorValor({
  serie,
  valorEntrada,
}: EhValidarPorValorProps): boolean {
  return serie.valor_serie_restante > valorEntrada;
}

export function encontrarSerieComValorAproximado({
  series,
  valorEntrada,
}: EncontrarSerieComValorAproximadoProps): DebentureSerie | null {
  return series.reduce((maisProxima, serieAtual) => {
    const diferencaMaisProxima = Math.abs(
      maisProxima.valor_serie_restante - valorEntrada,
    );
    const diferencaAtual = Math.abs(
      serieAtual.valor_serie_restante - valorEntrada,
    );

    return diferencaAtual < diferencaMaisProxima ? serieAtual : maisProxima;
  });
}

export function filtrarSeriesPorValor({
  series,
  valorEntrada,
}: FiltrarSeriesPorValorProps): DebentureSerie[] {
  return series.filter((serie) => serie.valor_serie_restante > valorEntrada);
}
