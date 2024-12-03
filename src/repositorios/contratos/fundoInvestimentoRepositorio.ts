import { Injectable } from '@nestjs/common';
import { Repositorio } from './repositorio';
import {
  FundoInvestimento,
  FundoInvestimentoSemVinculos,
} from 'src/@types/entities/fundos';
import { AtualizarFundoInvestimentoAptoDebenture } from 'src/@types/entities/debenture';

@Injectable()
export abstract class FundoInvestimentoRepositorio extends Repositorio {
  abstract encontrarPorId(id: number): Promise<FundoInvestimento | null>;
  abstract atualizar(
    id: FundoInvestimento['id'],
    dados: Partial<Omit<FundoInvestimentoSemVinculos, 'id'>>,
  ): Promise<FundoInvestimento>;
  abstract encontrarPorCpfCnpj(
    cprfCnpj: string,
  ): Promise<FundoInvestimento | null>;
  abstract encontrarComRelacionamentos(
    id: number,
  ): Promise<FundoInvestimento | null>;
  abstract atualizaAptoDebentureEvalorSerie(
    props: AtualizarFundoInvestimentoAptoDebenture,
  ): Promise<FundoInvestimento>;
  abstract buscarEstaAptoADebentureRepositorio(id: number): Promise<boolean>;
}
