export type Subclasse = {
  codigo_subclasse: string;
  tipo_identificador_subclasse: string;
  identificador_subclasse: string;
  nome_comercial_subclasse: string;
  data_inicio_atividade_subclasse: string;
  data_encerramento_subclasse: string;
  data_vigencia: string;
  data_atualizacao: string;
};

export type Classe = {
  codigo_classe: string;
  tipo_identificador_classe: string;
  identificador_classe: string;
  razao_social_classe: string;
  nome_comercial_classe: string;
  nivel1_categoria: string;
  data_inicio_atividade_classe: string;
  data_encerramento_classe: string;
  data_vigencia: string;
  data_atualizacao: string;
  subclasses: Subclasse[];
};

export type Fundo = {
  codigo_fundo: string;
  tipo_identificador_fundo: string;
  identificador_fundo: string;
  razao_social_fundo: string;
  nome_comercial_fundo: string;
  tipo_fundo: string;
  data_encerramento_fundo: string;
  data_vigencia: string;
  data_atualizacao: string;
  classes: Classe[];
};

export type Pageable = {
  number: number;
  size: number;
  sort: Record<string, unknown>;
};

export type Documento = {
  tipo_documento: string;
  url: string;
  data_vigencia: string;
  data_atualizacao: string;
};

export type Prestador = {
  codigo_tipo_prestador: string;
  identificador: string;
  razao_social: string;
  nome_comercial: string;
  tipo_pessoa: string;
  codigo_pais: string;
  data_inicio_vigencia: string;
  data_fim_vigencia: string;
  data_atualizacao: string;
};

export type PerfilComplementar = {
  codigo_b3: string;
  restricao_investimento: string;
  tipo_investidor: string;
  aplicacao_automatica: string;
  plano_previdencia: string;
  periodicidade_envio_pl_cota: string;
  calculo_cota: string;
  data_atualizacao: string;
};

export type FaixaEscalonamento = {
  valor_faixa_pl_inicial: number;
  valor_faixa_pl_final: number;
  valor_monetario: number;
  valor_percentual: number;
};

export type Taxa = {
  tipo_taxa: string;
  perfil_taxa: string;
  unidade_taxa: string;
  valor_monetario: number;
  valor_percentual: number;
  valor_piso: number;
  valor_fixo: number;
  valor_taxa_maxima: number;
  valor_percentual_taxa_maxima: number;
  informacoes_adicionais: string;
  data_inicio_vigencia: string;
  data_fim_vigencia: string;
  faixas_escalonamento: FaixaEscalonamento[];
};

export type TaxaPerformance = {
  perfil_taxa: string;
  periodicidade_cobranca: string;
  informacoes_adicionais: string;
  data_inicio_vigencia: string;
  data_fim_vigencia: string;
  detalhes: {
    valor_pl_inicial: number;
    valor_pl_final: number;
    valor_percentual: number;
    indice_referencia: string;
    valor_percentual_indice_referencia: number;
    valor_taxa_fixa: number;
  }[];
};

export type TaxaEntradaSaida = {
  tipo_entrada_saida: string;
  valor_monetario: number;
  valor_percentual: number;
  data_inicio_vigencia: string;
  data_fim_vigencia: string;
  data_atualizacao: string;
};

export type ValoresMinimosMovimentacao = {
  data_vigencia: string;
  indicador_prazo_emissao_cota: string;
  prazo_emissao_cota: number;
  indicador_prazo_conversao_resgate: string;
  prazo_conversao_resgate: number;
  indicador_prazo_pagamento_resgate: string;
  prazo_pagamento_resgate: number;
  regra_adicional_pagamento_resgate: string;
  dias_carencia_inicial: number;
  dias_carencia_ciclica: number;
  valor_minimo_aplicacao_inicial: number;
  valor_minimo_aplicacao_subsequente: number;
  valor_minimo_resgate: number;
  valor_minimo_permanencia: number;
  data_atualizacao: string;
};

export type IndiceBenchmark = {
  benchmark: string;
  data_inicio_vigencia: string;
  data_fim_vigencia: string;
  data_atualizacao: string;
};

export type Sufixo = {
  sufixo: string;
  data_inicio_vigencia: string;
  data_fim_vigencia: string;
  data_atualizacao: string;
};

export type SubclasseDetalhada = {
  codigo_subclasse: string;
  tipo_identificador_subclasse: string;
  identificador_subclasse: string;
  nome_comercial_subclasse: string;
  data_inicio_atividade_subclasse: string;
  data_encerramento_subclasse: string;
  perfil: PerfilComplementar;
  prestadores_subclasse: Prestador[];
  taxas_subclasse: Taxa[];
  taxas_entrada_saida_subclasse: TaxaEntradaSaida[];
  taxa_performance: TaxaPerformance;
  valores_minimos_movimentacao_subclasse: ValoresMinimosMovimentacao;
  data_vigencia_subclasse: string;
  data_atualizacao: string;
};

export type ClasseDetalhada = {
  codigo_classe: string;
  tipo_identificador_classe: string;
  identificador_classe: string;
  data_inicio_atividade_classe: string;
  razao_social_classe: string;
  nome_comercial_classe: string;
  tributacao_perseguida: string;
  alavancado: string;
  credito_privado: string;
  percentual_permitido_credito_privado: number;
  investimento_exterior: string;
  percentual_permitido_investimento_exterior: number;
  foco_atuacao: string;
  fundo_esg: string;
  forma_condominio: string;
  _95_por_cento_fundo_isento: string;
  entidade_investimento_fins_tributarios: string;
  infraestrutura: string;
  responsabilidade_limitada: string;
  categoria_cvm: string;
  composicao: string;
  tipo_anbima: string;
  nivel1_categoria: string;
  nivel2_categoria: string;
  nivel3_subcategoria: string;
  data_encerramento_classe: string;
  data_vigencia_classe: string;
  prestadores_classe: Prestador[];
  perfil_complementar: PerfilComplementar;
  taxas_classe: Taxa[];
  taxa_performance: TaxaPerformance;
  taxas_entrada_saida_classe: TaxaEntradaSaida[];
  valores_minimos_movimentacao_classe: ValoresMinimosMovimentacao;
  indices_benchmark: IndiceBenchmark[];
  sufixos: Sufixo[];
  subclasses: SubclasseDetalhada[];
  data_atualizacao: string;
};

export type FundoDetalhado = {
  codigo_fundo: string;
  tipo_identificador_fundo: string;
  identificador_fundo: string;
  tipo_fundo: string;
  razao_social_fundo: string;
  nome_comercial_fundo: string;
  adaptado_rcvm175: string;
  moeda: string;
  atributo: string;
  data_encerramento_fundo: string;
  documentos: Documento[];
  prestadores_fundo: Prestador[];
  data_vigencia_fundo: string;
  classes: ClasseDetalhada[];
  data_atualizacao: string;
};

export type SerieHistorica = {
  codigo_fundo: string;
  codigo_classe: string;
  codigo_subclasse: string;
  valor_patrimonio_liquido: number;
  valor_cota: number;
  valor_volume_total_aplicacoes: number;
  valor_volume_total_resgates: number;
  valor_volume_total_resgate_ir: number;
  numero_cotistas: number;
  codigo_moeda: string;
  data_competencia: string;
  data_atualizacao: string;
};
