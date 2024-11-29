export type CadastrarLaqusPayload = {
  callbackUrl: string;
  dadosCedente: {
    tipoDeEmpresa: string;
    tipoPessoa: string;
    funcao: string;
    email: string;
    cnpj: string;
    razaoSocial: string;
    atividadePrincipal: string;
    faturamentoMedioMensal12Meses: number;
    endereco: {
      cep: string;
      rua: string;
      numero: string;
      complemento: string;
      bairro: string;
      cidade: string;
      uf: string;
    };
    dadosBancarios: {
      codigoDoBanco: string;
      agencia: string;
      digitoDaAgencia: string;
      contaCorrente: string;
      digitoDaConta: string;
    };
    telefones: {
      numero: string;
      tipo: string;
    }[];
  };
};
