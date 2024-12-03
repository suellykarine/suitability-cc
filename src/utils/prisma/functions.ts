import { Decimal } from '@prisma/client/runtime/library';

type ConvertDecimalToNumber<T> = {
  [K in keyof T]: T[K] extends Date
    ? T[K]
    : T[K] extends Decimal
      ? number
      : T[K] extends Array<infer U>
        ? ConvertDecimalToNumber<U>[]
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

  if (Array.isArray(dados)) {
    return dados.map((item) =>
      converterCamposDecimais(item),
    ) as ConvertDecimalToNumber<T>;
  }

  if (typeof dados === 'object' && dados !== null) {
    return Object.fromEntries(
      Object.entries(dados).map(([key, value]) => {
        if (value instanceof Date) {
          return [key, value];
        }
        if (value instanceof Decimal) {
          return [key, value.toNumber()];
        }
        if (typeof value === 'object' && value !== null) {
          return [key, converterCamposDecimais(value)];
        }
        return [key, value];
      }),
    ) as ConvertDecimalToNumber<T>;
  }

  return dados as ConvertDecimalToNumber<T>;
};
