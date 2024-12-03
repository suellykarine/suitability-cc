import { CarteiraInvestimento } from './carteiraInvestimento';
import { ContaInvestidor } from './contaInvestidor';
import { ContaRepasse } from './contaRepasse';
import { DebentureSerieInvestidor } from './debenture';
import { Documento } from './documento';
import { FeedbackBackoffice, FundoBackoffice } from './backoffice';
import { Endereco } from './endereco';
import { Usuario, UsuarioFundoInvestimento } from './usuario';

export type FundoInvestimentoSemVinculos = {
  id: number;
  nome?: string;
  razao_social?: string;
  nome_fantasia?: string;
  codigo_anbima?: string;
  classe_anbima?: string;
  atividade_principal?: string;
  id_status_fundo_investimento?: number;
  id_fundo_backoffice?: number;
  id_administrador_fundo?: number;
  id_representante_fundo?: number;
  detalhes?: string;
  data_criacao?: Date;
  cpf_cnpj?: string;
  tipo_estrutura?: string;
  faturamento_anual?: string;
  apto_debenture: boolean;
  valor_serie_debenture?: number;
  nota_investidor_suitability?: number;
  perfil_investidor_suitability?: string;
  data_expiracao_suitability?: Date;
};

export type FundoInvestimento = FundoInvestimentoSemVinculos & {
  carteira_investimento?: CarteiraInvestimento[];
  conta_investidor?: ContaInvestidor[];
  conta_repasse?: ContaRepasse;
  debenture_serie_investidor?: DebentureSerieInvestidor[];
  documento?: Documento[];
  feedback_backoffice?: FeedbackBackoffice[];
  administrador_fundo?: AdministradorFundo;
  fundo_backoffice?: FundoBackoffice;
  status_fundo_investimento?: StatusFundoInvestimento;
  representante_fundo?: RepresentanteFundo;
  fundo_investimento_gestor_fundo?: FundoInvestimentoGestorFundo[];
  procurador_fundo_fundo_investimento?: ProcuradorFundoFundoInvestimento[];
};

export type StatusFundoInvestimento = {
  id: number;
  nome: string;
  descricao: string;
  fundo_investimento?: FundoInvestimento[];
};

export type AdministradorFundo = {
  id: number;
  nome?: string;
  email?: string;
  telefone?: string;
  id_endereco?: number;
  cnpj?: string;
  endereco?: Endereco;
  administrador_fundo_representante_fundo?: AdministradorFundoRepresentanteFundo[];
  fundo_investimento?: FundoInvestimento[];
};

export type AdministradorFundoRepresentanteFundo = {
  id: number;
  id_administrador_fundo: number;
  id_representante_fundo: number;
  administrador_fundo: AdministradorFundo;
  representante_fundo: RepresentanteFundo;
};

export type RepresentanteFundo = {
  id: number;
  nome?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  id_endereco?: number;
  administrador_fundo_representante_fundo?: AdministradorFundoRepresentanteFundo[];
  fundo_investimento?: FundoInvestimento[];
  endereco?: Endereco;
};

export type GestorFundo = {
  id: number;
  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  inscricao_municipal?: string;
  inscricao_estadual?: string;
  atividade_principal?: string;
  id_endereco?: number;
  id_status_gestor_fundo?: number;
  data_criacao?: Date;
  documento?: Documento[];
  fundo_investimento_gestor_fundo?: FundoInvestimentoGestorFundo[];
  endereco?: Endereco;
  status_gestor_fundo?: StatusGestorFundo;
  usuario?: Usuario[];
};

export type StatusGestorFundo = {
  id: number;
  nome: string;
  descricao: string;
  gestor_fundo?: GestorFundo[];
};

export type ProcuradorFundo = {
  id: number;
  nome?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  id_endereco?: number;
  endereco?: Endereco;
  procurador_fundo_fundo_investimento?: ProcuradorFundoFundoInvestimento[];
};

export type ProcuradorFundoFundoInvestimento = {
  id: number;
  id_fundo_investimento: number;
  id_procurador_fundo: number;
  fundo_investimento: FundoInvestimento;
  procurador_fundo: ProcuradorFundo;
};

export type FundoInvestimentoGestorFundo = {
  id: number;
  id_fundo_investimento: number;
  id_gestor_fundo: number;
  fundo_investimento?: FundoInvestimento;
  gestor_fundo?: GestorFundo;
  usuario_fundo_investimento?: UsuarioFundoInvestimento[];
};
