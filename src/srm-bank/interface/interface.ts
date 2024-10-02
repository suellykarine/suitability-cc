interface SucessoCriarConta {
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
interface ErroCriarConta {
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
  gerente: {
    identificadorGerente: string;
    nome: string;
    filial: string;
  };
  nomeEmpresarial: string;
  dataAbertura: string;
  faturamentoAnual: number;
  ramoAtividade: {
    codigo: number;
    descricao: string;
  };
  recuperacaoJudicial: {
    recuperacaoJudicial: boolean;
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
