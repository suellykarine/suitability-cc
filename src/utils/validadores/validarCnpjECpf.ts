import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { removerNaoNumeros } from '../removerNaoNumeros';

@ValidatorConstraint({ name: 'validateCNPJ', async: false })
export class ValidarCNPJ implements ValidatorConstraintInterface {
  validate(cnpj: string) {
    const cnpjNormalizado = removerNaoNumeros(cnpj);
    if (cnpjNormalizado.length !== 14 || /^(.)\1+$/.test(cnpjNormalizado)) {
      return false;
    }

    function calcularDigitoVerificadorCNPJ(cnpj: string, fatores: number[]) {
      const soma = cnpj
        .split('')
        .reduce(
          (acc, digito, index) => acc + parseInt(digito) * fatores[index],
          0,
        );
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    }

    const primeirosFatores = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const segundosFatores = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const digitoVerificador1 = calcularDigitoVerificadorCNPJ(
      cnpjNormalizado.slice(0, 12),
      primeirosFatores,
    );
    const digitoVerificador2 = calcularDigitoVerificadorCNPJ(
      cnpjNormalizado.slice(0, 12) + digitoVerificador1,
      segundosFatores,
    );

    return (
      digitoVerificador1 === parseInt(cnpjNormalizado[12]) &&
      digitoVerificador2 === parseInt(cnpjNormalizado[13])
    );
  }

  defaultMessage() {
    return 'O CNPJ informado não é válido.';
  }
}

@ValidatorConstraint({ name: 'validateCPF', async: false })
export class ValidarCPF implements ValidatorConstraintInterface {
  validate(cpf: string) {
    const cpfNormalizado = removerNaoNumeros(cpf);

    if (cpfNormalizado.length !== 11 || /^(.)\1+$/.test(cpfNormalizado)) {
      return false;
    }

    function calcularDigitoVerificador(digitos: string, fator: number): number {
      const soma = digitos
        .split('')
        .reduce(
          (acc, digito, index) => acc + parseInt(digito) * (fator - index),
          0,
        );
      const resto = (soma * 10) % 11;
      return resto === 10 ? 0 : resto;
    }

    const digitoVerificador1 = calcularDigitoVerificador(
      cpfNormalizado.slice(0, 9),
      10,
    );
    if (digitoVerificador1 !== parseInt(cpfNormalizado[9])) {
      return false;
    }

    const digitoVerificador2 = calcularDigitoVerificador(
      cpfNormalizado.slice(0, 10),
      11,
    );
    if (digitoVerificador2 !== parseInt(cpfNormalizado[10])) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'O CPF informado não é válido.';
  }
}
