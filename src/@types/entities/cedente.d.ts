import { DadosBancarios, Favorecido } from './banco';
import { Endereco } from './endereco';

type Gerente = {
  identificadorGerente: string;
  nome: string;
  filial: string;
};
type ContaCorrente = {
  favorecido: Favorecido;
  dadosBancarios: Omit<
    DadosBancarios,
    'tipoChavePix' | 'valorChavePix' | 'agenciaDigitoVerificador'
  >;
};
export type EnderecoCedente = Pick<
  Endereco,
  'logradouro' | 'numero' | 'complemento' | 'bairro' | 'cep' | 'cidade'
> & {
  uf: string;
};
export type Cedente = {
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
  recuperacaoJudicial: {
    recuperacaoJudicial: false;
    status: string;
  };
  situacaoCadastral: {
    descricao: string;
    data: string;
  };
  cnaePrincipal: {
    codigo: string;
    descricao: string;
  };
  quantidadeFuncionarios: 0;
  endereco: EnderecoCedente;
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
  contaCorrente: ContaCorrente[];
};
