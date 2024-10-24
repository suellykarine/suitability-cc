import { EnderecoCedente } from 'src/@types/entities/cedente';

type Contato = {
  nome: string;
  email: string;
  telefone: string;
};
type Debenturista = {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  endereco: EnderecoCedente;
  contato: Contato;
};
type Representantes = {
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
};
type ContaSerie = {
  banco: string;
  agencia: string;
  conta: string;
  digito: string;
};

export type SolicitarSerieType = {
  numero_emissao: number;
  numero_serie: number;
  callback_url: string;
  debenturista: Debenturista;
  representantes: Representantes[];
  valor_total_integralizado: number;
  conta_serie: ContaSerie;
};
