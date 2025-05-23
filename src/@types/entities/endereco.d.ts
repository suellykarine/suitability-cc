import {
  AdministradorFundo,
  GestorFundo,
  ProcuradorFundo,
  RepresentanteFundo,
} from './fundos';
import { Usuario } from './usuario';

export type EnderecoSemVinculo = {
  id: number;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
};

export type Endereco = EnderecoSemVinculo & {
  administrador_fundo?: AdministradorFundo[];
  gestor_fundo?: GestorFundo[];
  procurador_fundo?: ProcuradorFundo[];
  representante_fundo?: RepresentanteFundo[];
  usuario?: Usuario[];
};
