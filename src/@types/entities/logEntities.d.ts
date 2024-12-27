export type Log = {
  id: string;
  mensagem: string | null;
  detalhes: string | null;
  acao: string;
  tipo: LogTipo;
  criadoEm: Date;
};

export type LogTipo = 'INFO' | 'ERRO' | 'AVISO';
