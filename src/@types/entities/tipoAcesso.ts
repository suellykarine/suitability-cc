import { AcessoUsuario } from './usuario';

export type TipoAcesso = {
  id: number;
  acesso: string;
  descricao: string;
  acesso_usuario?: AcessoUsuario[];
};
