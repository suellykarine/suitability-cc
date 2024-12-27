export function removerCiclos(objeto: any, vistos = new WeakSet()): any {
  if (objeto === null || typeof objeto !== 'object') {
    return objeto;
  }

  if (vistos.has(objeto)) {
    return undefined;
  }

  vistos.add(objeto);

  if (Array.isArray(objeto)) {
    return objeto
      .map((item) => removerCiclos(item, vistos))
      .filter((item) => item !== undefined);
  }

  return Object.entries(objeto).reduce((acumulador, [chave, valor]) => {
    const novoValor = removerCiclos(valor, vistos);
    if (novoValor !== undefined) {
      return { ...acumulador, [chave]: novoValor };
    }
    return acumulador;
  }, {});
}

export function normalizarChaves(objeto: any): any {
  if (objeto === null || typeof objeto !== 'object') {
    return objeto;
  }

  if (Array.isArray(objeto)) {
    return objeto.map(normalizarChaves);
  }

  return Object.entries(objeto).reduce((resultado, [chave, valor]) => {
    const chaveNormalizada = chave.replace(/\./g, '_').replace(/\$/g, '_');
    resultado[chaveNormalizada] = normalizarChaves(valor);
    return resultado;
  }, {} as any);
}
