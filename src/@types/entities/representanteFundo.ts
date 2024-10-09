import { AdministradorFundoRepresentanteFundo } from './administradorFundo';
import { Endereco } from './endereco';
import { FundoInvestimento } from './fundos';

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
