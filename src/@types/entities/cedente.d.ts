import { DadosBancarios } from './banco';

type Gerente = {
  identificadorGerente: string;
  nome: string;
  filial: string;
};
export type Endereco = {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
};
export type CedenteType = {
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
  endereco: Endereco;
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
  contaCorrente: [
    {
      favorecido: {
        identificador: string;
        nome: string;
      };
      dadosBancarios: Omit<
        DadosBancarios,
        'tipoChavePix' | 'valorChavePix' | 'agenciaDigitoVerificador'
      >;
    },
  ];
};
