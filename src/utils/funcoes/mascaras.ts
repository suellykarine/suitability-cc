export function formatarBrlParaNumero(moeda: string) {
  return parseFloat(moeda.replace(/[R$\s.]/g, '').replace(',', '.'));
}
