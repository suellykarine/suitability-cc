export function converterDataParaISO(data: string) {
  const [day, month, year] = data.split('/');
  return `${year}-${month}-${day}`;
}
