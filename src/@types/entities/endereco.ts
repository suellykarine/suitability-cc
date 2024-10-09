import { AdministradorFundo } from './administradorFundo';
import { GestorFundo } from './gestorFundo';
import { ProcuradorFundo } from './procuradorFundo';
import { RepresentanteFundo } from './representanteFundo';
import { Usuario } from './usuario';

export type Endereco = {
  id: number;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  administrador_fundo?: AdministradorFundo[];
  gestor_fundo?: GestorFundo[];
  procurador_fundo?: ProcuradorFundo[];
  representante_fundo?: RepresentanteFundo[];
  usuario?: Usuario[];
};
