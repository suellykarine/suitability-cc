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
    return objeto.map((item) => normalizarChaves(item));
  }

  return Object.fromEntries(
    Object.entries(objeto).map(([chave, valor]) => [
      chave.replace(/[.$]/g, '_'),
      normalizarChaves(valor),
    ]),
  );
}
