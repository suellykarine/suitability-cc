import { AcessoUsuario } from './usuario';

export type Modulo = {
  id: number;
  nome: string;
  descricao: string;
  acesso_usuario?: AcessoUsuario[];
};
