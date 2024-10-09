import { Usuario } from './usuario';

export type CartaConvite = {
  id: number;
  nome?: string;
  empresa?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  cnpj?: string;
  mensagem?: string;
  id_status_carta_convite?: number;
  id_usuario?: number;
  status_carta_convite?: StatusCartaConvite;
  usuario?: Usuario;
};

export type StatusCartaConvite = {
  id: number;
  nome: string;
  descricao: string;
  carta_convite?: CartaConvite[];
};
