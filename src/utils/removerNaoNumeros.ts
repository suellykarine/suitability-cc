export function removerNaoNumeros(input: string): string {
  return input.replace(/[^\d]/g, '');
}
