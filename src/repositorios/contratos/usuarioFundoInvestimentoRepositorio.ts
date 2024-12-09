import { UsuarioFundoInvestimento } from 'src/@types/entities/usuario';
import { Repositorio } from './repositorio';

export abstract class UsuarioFundoInvestimentoRepositorio extends Repositorio {
  abstract encontrarPeloIdGestorFundo(
    id: number,
  ): Promise<UsuarioFundoInvestimento | null>;

  abstract encontrarPorIdUsuarioComRelacionamento(
    id: number,
  ): Promise<UsuarioFundoInvestimento[] | null>;

  abstract criar(
    data: Omit<UsuarioFundoInvestimento, 'id'>,
  ): Promise<UsuarioFundoInvestimento>;

  abstract removerPorFundoGestor(idFundoGestor: number): Promise<void>;

  abstract encontrarPorUsuarioEFundoGestor(
    idUsuario: number,
    idFundoGestor: number,
  ): Promise<UsuarioFundoInvestimento | null>;

  abstract buscarPorGestorFundo(
    idGestorFundo: number,
  ): Promise<UsuarioFundoInvestimento | null>;

  abstract remover(id: number): Promise<void>;
}
