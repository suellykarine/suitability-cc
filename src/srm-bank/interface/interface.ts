import {
  CnaePrincipal,
  Gerente,
  RecuperacaoJudicial,
  SituacaoCadastral,
} from 'src/@types/entities/banco';

export interface SucessoCriarConta {
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
}
export interface ErroCriarConta {
  sucesso: boolean;
  id: string;
  status: number;
  erro: string;
  codigoErro: string;
  motivo: string;
  data: string;
  metodo: string;
  url: string;
}
export type IRespostaSrmBank = SucessoCriarConta | ErroCriarConta;

export type IBuscarCedente = {
  codigoCedente: number;
  identificadorCedente: string;
  gerente: Gerente;
  nomeEmpresarial: string;
  dataAbertura: string;
  faturamentoAnual: number;
  ramoAtividade: {
    codigo: number;
    descricao: string;
  };
  recuperacaoJudicial: RecuperacaoJudicial;
  situacaoCadastral: SituacaoCadastral;
  cnaePrincipal: CnaePrincipal;
  quantidadeFuncionarios: number;
  endereco: {
    uf: string;
    cep: string;
    cidade: string;
    bairro: string;
    logradouro: string;
    numero: string;
    complemento: string;
  };
  telefone: {
    numero: string;
    ddd: string;
  };
  email: string;
  usuarioInclusao: string;
  dataHoraInclusao: string;
  sociosPessoaFisica: [];
  sociosPessoaJuridica: [];
  representantesLegais: [];
  devedoresSolidariosPessoaFisica: [];
  devedoresSolidariosPessoaJuridica: [];
  contaCorrente: [];
};
