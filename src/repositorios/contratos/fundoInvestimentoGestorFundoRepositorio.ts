import { Injectable } from '@nestjs/common';
import { FundoInvestimentoGestorFundo } from 'src/@types/entities/fundos';
import { Repositorio } from './repositorio';

@Injectable()
export abstract class FundoInvestimentoGestorFundoRepositorio extends Repositorio {
  abstract criar(
    data: Omit<FundoInvestimentoGestorFundo, 'id'>,
  ): Promise<FundoInvestimentoGestorFundo>;

  abstract encontrarPorId(
    id: number,
  ): Promise<FundoInvestimentoGestorFundo | null>;

  abstract encontrarPorIdDoFundo(
    id: number,
  ): Promise<FundoInvestimentoGestorFundo | null>;

  abstract buscarPorFundoEGestor(
    idFundo: number,
    idGestor: number,
  ): Promise<any[]>;
  abstract remover(id: number): Promise<void>;

  abstract encontrarPorFundo(
    idFundo: number,
  ): Promise<FundoInvestimentoGestorFundo | null>;
}
