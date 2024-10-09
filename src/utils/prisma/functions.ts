import { Decimal } from '@prisma/client/runtime/library';

type ConvertDecimalToNumber<T> = {
  [K in keyof T]: T[K] extends Date
    ? T[K]
    : T[K] extends Decimal
      ? number
      : T[K] extends object
        ? ConvertDecimalToNumber<T[K]>
        : T[K];
};
export const converterCamposDecimais = <T>(
  dados: T,
): ConvertDecimalToNumber<T> => {
  if (!dados) {
    return dados as ConvertDecimalToNumber<T>;
  }

  return Object.fromEntries(
    Object.entries(dados).map(([key, value]) => {
      if (value instanceof Date) {
        return [key, value];
      }
      if (value instanceof Decimal) {
        return [key, value.toNumber()];
      }
      if (value === null || value === 0) {
        return [key, value];
      }
      if (typeof value === 'object' && value !== null) {
        return [key, converterCamposDecimais(value)];
      }
      return [key, value];
    }),
  ) as ConvertDecimalToNumber<T>;
};
