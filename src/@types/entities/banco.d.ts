export type Favorecido = {
  identificador: string;
  nome: string;
};

type Historico = {
  dataHoraInclusao: string;
  dataHoraAlteracao: string;
  dataHoraExclusao: string;
  usuarioUltimaAlteracao: string;
};

export type DadosBancarios = {
  codigoContaCorrente: number;
  contaDigital: boolean;
  pix: boolean;
  tipoChavePix: string;
  valorChavePix: string;
  tipoConta: string;
  descricaoConta: string;
  contaLigada: boolean;
  bancoCodigo: number;
  bancoNome: string;
  agencia: string;
  agenciaDigitoVerificador: string;
  contaCorrente: string;
  contaCorrenteDigitoVerificador: string;
  ativo: boolean;
  historico: Historico;
};
