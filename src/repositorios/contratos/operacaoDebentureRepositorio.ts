import { OperacaoDebenture } from 'src/@types/entities/operacaoDebenture';

export abstract class OperacaoDebentureRepositorio {
  abstract buscarPorGestorFundo(id: number): Promise<OperacaoDebenture[]>;
}
