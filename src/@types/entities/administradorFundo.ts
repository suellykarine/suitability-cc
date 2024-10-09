import { Endereco } from './endereco';
import { FundoInvestimento } from './fundos';
import { RepresentanteFundo } from './representanteFundo';

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
