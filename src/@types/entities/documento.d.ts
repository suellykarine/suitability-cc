import { FeedbackBackoffice } from './backoffice';
import { FundoInvestimento, GestorFundo } from './fundos';
import { Usuario } from './usuario';

export type Documento = {
  id: number;
  data_referencia?: Date;
  data_upload?: Date;
  extensao?: string;
  nome_arquivo?: string;
  tipo_documento?: string;
  url?: string;
  id_status_documento?: number;
  id_usuario?: number;
  id_gestor_fundo?: number;
  id_fundo_investimento?: number;
  data_validade_documento?: Date;
  fundo_investimento?: FundoInvestimento;
  gestor_fundo?: GestorFundo;
  status_documento?: StatusDocumento;
  usuario?: Usuario;
  feedback_backoffice?: FeedbackBackoffice[];
};

export type StatusDocumento = {
  id: number;
  nome: string;
  descricao: string;
  documento?: Documento[];
};
