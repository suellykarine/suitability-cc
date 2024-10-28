import { Injectable } from '@nestjs/common';
import { FundoInvestimento } from 'src/@types/entities/fundos';
import { Repositorio } from './repositorio';

@Injectable()
export abstract class FundoInvestimentoRepositorio extends Repositorio {
  abstract encontrarPorId(id: number): Promise<FundoInvestimento | null>;
  abstract encontrarPorCpfCnpj(
    cprfCnpj: string,
  ): Promise<FundoInvestimento | null>;
  abstract encontrarComRelacionamentos(
    id: number,
  ): Promise<FundoInvestimento | null>;
}
