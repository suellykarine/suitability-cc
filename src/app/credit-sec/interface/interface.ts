import { AtivosInvest } from 'src/@types/entities/ativoInvestido';
import { Conta } from 'src/@types/entities/banco';
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

type Parcelas = {
  data_vencimento: string;
  valor_face: number;
  valor_operado: number;
};
type Titulos = {
  numero: string;
  taxa_cessao: number;
  tipo: string;
  sacado: Pick<Debenturista, 'cnpj' | 'razao_social' | 'nome_fantasia'>;
  data_emissao: string;
  lastro: {
    url: string;
  };
  parcelas: Parcelas[];
};

export type SolicitarRemessaType = {
  numero_remessa: string;
  numero_emissao: number;
  numero_serie: number;
  callback_url: string;
  titulos: Titulos[];
};

export type OperacoesCedente = {
  codigoOperacao: number;
  dataOperacao: string;
  valorBruto: number;
  valorLiquido: number;
  statusOperacao: string;
  produtoSigla: string;
  empresaChave: string;
  fundoSigla: string;
  fundoNome: string;
  codigoControleParceiro: string;
  contaCorrentePagadora: Conta;
  cedente: {
    identificador: string;
  };
  ativosInvest: AtivosInvest[];
};

export type NumerosSolicitarRemessa = Pick<
  SolicitarRemessaType,
  'numero_serie' | 'numero_emissao' | 'numero_remessa'
> & { data_operacao: string };

export type BodyCriarRegistroOperacao = {
  cedenteIdentificador: string;
  codigoControleParceiroValor: string;
  investidorIdentificador: string;
  produtoSigla: string;
};
