import { Documento } from './documento';
import { Endereco } from './endereco';
import { FundoInvestimentoGestorFundo } from './fundoInvestimentoGestorFundo';
import { Usuario } from './usuario';

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
