import {
  StatusCreditSec,
  StatusCreditSecNaoNormalizado,
} from 'src/@types/entities/creditSec';

export const statusRetornoCreditSecDicionario = {
  FAILURE: 'REPROVADO',
  SUCCESS: 'APROVADO',
  PENDING: 'PENDENTE',
} as Record<StatusCreditSecNaoNormalizado, StatusCreditSec>;
