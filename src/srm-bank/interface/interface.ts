import { Favorecido, DadosBancarios } from 'src/@types/entities/banco';

export type RespostaCriarContaSrmBank = {
  sucesso: boolean;
  documentoTitular: string;
  nomeTitular: string;
  id: number;
  agencia: string;
  conta: string;
  tipoConta: 'CC';
  centroCusto: {
    codigo: string;
    nome: string;
  };
};

export type RespostaBuscarContaSrmBank = {
  favorecido: Favorecido;
  dadosBancarios: DadosBancarios;
};
export type RegistrarContaNoCC = {
  id_fundo_investidor: number;
  identificador_favorecido: string;
  nome_favorecido: string;
  agencia: string;
  agencia_digito: string;
  codigo_banco: string;
  conta: string;
  conta_digito: string;
  codigo_conta: string;
};
