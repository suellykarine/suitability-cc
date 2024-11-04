import { CartaConvite } from './cartaConvite';
import { Documento } from './documento';
import { Endereco } from './endereco';
import { FeedbackBackoffice } from './backoffice';
import { FundoInvestimentoGestorFundo, GestorFundo } from './fundos';
import { TransacaoCarteira } from './transacaoCarteira';

export type Usuario = {
  id: number;
  nome?: string;
  email?: string;
  telefone?: string;
  senha?: string;
  cpf?: string;
  data_nascimento?: Date;
  id_tipo_usuario?: number;
  id_endereco?: number;
  id_gestor_fundo?: number;
  id_status_usuario?: number;
  data_criacao?: Date;
  acesso_usuario?: AcessoUsuario[];
  carta_convite?: CartaConvite[];
  documento?: Documento[];
  feedbacks_backoffice_as_backoffice?: FeedbackBackoffice[];
  feedbacks_backoffice_as_investidor?: FeedbackBackoffice[];
  transacao_carteira?: TransacaoCarteira[];
  endereco?: Endereco;
  gestor_fundo?: GestorFundo;
  status_usuario?: StatusUsuario;
  tipo_usuario?: TipoUsuario;
  usuario_fundo_investimento?: UsuarioFundoInvestimento[];
};

export type UsuarioFundoInvestimento = {
  id: number;
  id_usuario?: number;
  id_fundo_investimento_gestor_fundo?: number;
  acesso_permitido?: boolean;
  fundo_investimento_gestor_fundo?: FundoInvestimentoGestorFundo;
  usuario?: Usuario;
};

export type TipoUsuario = {
  id?: number;
  tipo?: string;
  descricao?: string;
  usuario?: Usuario[];
};

export type StatusUsuario = {
  id?: number;
  nome?: string;
  descricao?: string;
  usuario?: Usuario[];
};

export type AcessoUsuario = {
  id: number;
  id_usuario: number;
  id_modulo: number;
  id_tipo_acesso: number;
  modulo: Modulo;
  tipo_acesso: TipoAcesso;
  usuario: Usuario;
};

export type TipoAcesso = {
  id: number;
  acesso: string;
  descricao: string;
  acesso_usuario?: AcessoUsuario[];
};

export type Modulo = {
  id: number;
  nome: string;
  descricao: string;
  acesso_usuario?: AcessoUsuario[];
};
