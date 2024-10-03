import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { removerNaoNumeros } from '../removerNaoNumeros';

@ValidatorConstraint({ name: 'validateCEP', async: false })
export class ValidarCEP implements ValidatorConstraintInterface {
  validate(cep: string) {
    const cepNormalizado = removerNaoNumeros(cep);
    return cepNormalizado.length === 8 && /^\d{8}$/.test(cepNormalizado);
  }

  defaultMessage() {
    return 'O CEP informado não é válido. Deve conter exatamente 8 dígitos.';
  }
}
