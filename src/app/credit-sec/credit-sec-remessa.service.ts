import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { sigmaHeaders } from 'src/app/autenticacao/constants';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import {
  BodyCriacaoRemessaDto,
  BodyRetornoRemessaDto,
} from './dto/remessa-callback.dto';
import {
  BodyCriarRegistroOperacao,
  NumerosSolicitarRemessa,
  OperacoesCedente as OperacaoCedente,
  SolicitarRemessaType,
} from './interface/interface';
import { AtivosInvest } from 'src/@types/entities/ativoInvestido';
import { Cron } from '@nestjs/schedule';
import { OperacaoDebentureRepositorio } from 'src/repositorios/contratos/operacaoDebentureRepositorio';
import { SigmaService } from '../sigma/sigma.service';
import { statusRetornoCreditSecDicionario } from './const';
import { OperacaoDebentureSemVinculo } from 'src/@types/entities/operacaoDebenture';
import { DebentureSerieService } from '../debentures/debentures-serie.service';
import { PagamentoOperacaoService } from '../sigma/sigma.pagamentoOperacao.service';
import {
  ErroAplicacao,
  ErroRequisicaoInvalida,
  ErroServidorInterno,
} from 'src/helpers/erroAplicacao';
import { OperacoesInvestService } from '../operacoes-invest/operacoes-invest.service';
import { LogService } from '../global/logs/log.service';
import { CcbService } from '../ccb/ccb.service';
import { tratarErroRequisicao } from '../../utils/funcoes/tratarErro';

@Injectable()
export class CreditSecRemessaService {
  constructor(
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly debentureSerieRepositorio: DebentureSerieRepositorio,
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
    private readonly operacaoDebentureRepositorio: OperacaoDebentureRepositorio,
    private readonly sigmaService: SigmaService,
    private readonly debentureSerieService: DebentureSerieService,
    private readonly pagamentoOperacaoService: PagamentoOperacaoService,
    private readonly operacaoInvestService: OperacoesInvestService,
    private readonly logService: LogService,
    private readonly ccbService: CcbService,
  ) {}
  @Cron('0 0 10 * * 1-5')
  async buscarStatusSolicitacaoRemessa() {
    try {
      const remessasPendentes =
        await this.operacaoDebentureRepositorio.buscarOperacoesPeloStatusCreditSec(
          'PENDING',
        );

      for (const remessa of remessasPendentes) {
        const debentureSerieInvestidor =
          await this.debentureSerieInvestidorRepositorio.encontrarPorId(
            remessa.id_debenture_serie_investidor,
          );
        const debentureSerie = debentureSerieInvestidor.debenture_serie;
        const debenture = debentureSerieInvestidor.debenture_serie.debenture;

        const buscarStatusRemessa = await this.buscarStatusRemessa({
          numero_emissao: debenture.numero_debenture,
          numero_remessa: String(remessa.codigo_operacao),
          numero_serie: debentureSerie.numero_serie,
        });

        await this.registrarRetornoCreditSec(buscarStatusRemessa);
      }
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        acao: 'creditSecRemessa.buscarStatusSolicitacaoRemessa',
        mensagem: `Erro ao buscar status solicitação da remessa`,
        informacaoAdicional: {
          error,
        },
      });
    }
  }

  async solicitarRemessa(data: BodyCriacaoRemessaDto) {
    try {
      const debenture_serie =
        await this.debentureSerieRepositorio.encontrarSeriePorNumeroEmissaoNumeroSerie(
          +data.numero_debenture,
          +data.numero_serie,
        );

      const debentureSerieInvestidor =
        await this.debentureSerieInvestidorRepositorio.encontrarMaisRecentePorIdDebentureSerie(
          debenture_serie.id,
        );
      const fundoInvestimento =
        await this.fundoInvestimentoRepositorio.encontrarPorId(
          debentureSerieInvestidor.id_fundo_investimento,
        );

      const operacaoCedente = await this.encontrarOperacoesCedenteSigma(
        String(data.codigo_operacao),
      );
      const body = await this.montarBodySolicitarRemessa(
        {
          numero_emissao: data.numero_debenture,
          numero_serie: data.numero_serie,
          numero_remessa: String(operacaoCedente.codigoOperacao),
          data_operacao: operacaoCedente.dataOperacao,
        },
        operacaoCedente.ativosInvest,
      );

      const solicitarRemessa = await this.solicitarRemessaCreditSec(body);

      await this.debentureSerieService.registroBaixaValorSerie(
        debenture_serie.id,
        operacaoCedente.valorLiquido,
      );

      await this.criarOperacaoDebentureCreditConnect({
        codigo_operacao: data.codigo_operacao,
        status_retorno_creditsec: 'PENDENTE',
        id_debenture_serie_investidor: debentureSerieInvestidor.id,
        data_inclusao: new Date(),
      });

      const bodyCriarOperacaoSigma: BodyCriarRegistroOperacao = {
        cedenteIdentificador: '49947676000186',
        codigoControleParceiroValor: operacaoCedente.codigoControleParceiro,
        investidorIdentificador: fundoInvestimento.cpf_cnpj,
        produtoSigla: 'DEBINVEST',
      };
      await this.criarRegistroDeOperacaoSigma(
        String(data.codigo_operacao),
        bodyCriarOperacaoSigma,
      );

      return {
        sucesso: true,
        operacao: operacaoCedente.codigoOperacao,
        data: solicitarRemessa,
      };
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        mensagem: 'Erro ao solicitar remessa',
        acao: 'creditSecRemessaService.solicitarRemessa',
        informacaoAdicional: { data, erro: error },
      });
    }
  }
  async registrarRetornoCreditSec(data: BodyRetornoRemessaDto) {
    try {
      const operacao =
        await this.operacaoDebentureRepositorio.buscarOperacaoPeloCodigoOperacao(
          data.numero_remessa,
        );

      if (!operacao) {
        throw new ErroRequisicaoInvalida({
          acao: 'creditSecRemessaService.registrarRetornoCreditSec',
          mensagem: 'Operação não encontrada',
          informacaoAdicional: {
            data,
          },
        });
      }

      const operacaoEhPendente =
        operacao.status_retorno_creditsec === 'PENDENTE';

      if (!operacaoEhPendente) {
        throw new ErroRequisicaoInvalida({
          acao: 'creditSecRemessaService.registrarRetornoCreditSec',
          mensagem: 'Operação não está pedente',
          informacaoAdicional: {
            numero_remessa: data.numero_remessa,
          },
        });
      }

      const statusRetorno = statusRetornoCreditSecDicionario[data.status];
      if (statusRetorno === 'APROVADO') {
        const debentureSerieInvestidor =
          await this.debentureSerieInvestidorRepositorio.encontrarPorId(
            operacao.id_debenture_serie_investidor,
          );

        await this.pagamentoOperacaoService.incluirPagamento(
          +data.numero_remessa,
          debentureSerieInvestidor.id_conta_investidor,
        );

        await this.destravarOperacaoDebentureSigma(data.numero_remessa);

        await this.operacaoDebentureRepositorio.atualizar(operacao.id, {
          status_retorno_creditsec: statusRetorno,
        });
        await this.logService.info({
          mensagem: 'Remessa Aprovada pela CreditSec',
          acao: 'creditSecRemessaService.registrarRetornoCreditSec.aprovado',
          informacaoAdicional: { data },
        });
        return;
      }

      if (statusRetorno === 'REPROVADO') {
        const motivos = data.titulos_rejeitados.reduce((acc, curr) => {
          return `${acc} | ${curr.motivo_rejeicao}`;
        }, '');

        this.logService.aviso({
          mensagem: 'Remessa Recusada pela CreditSec',
          acao: 'creditSecRemessaService.registrarRetornoCreditSec.reprovado',
          informacaoAdicional: {
            data,
            motivos,
          },
        });
        const debentureSerieInvestidor =
          await this.debentureSerieInvestidorRepositorio.encontrarPorId(
            operacao.id_debenture_serie_investidor,
          );
        const debentureSerie = debentureSerieInvestidor.debenture_serie;
        const operacaoDetalhada =
          await this.operacaoInvestService.buscarTransacaoPorCodigoOperacao(
            operacao.codigo_operacao,
          );

        const valorOperacao = operacaoDetalhada.valorLiquido;

        await this.debentureSerieService.estornoBaixaValorSerie(
          debentureSerie.id,
          valorOperacao,
        );

        await this.operacaoDebentureRepositorio.atualizar(operacao.id, {
          status_retorno_creditsec: statusRetorno,
          data_exclusao: new Date(),
          mensagem_retorno_creditsec: motivos,
        });

        await this.sigmaService.excluirOperacaoDebentureSigma({
          codigoOperacao: data.numero_remessa,
          complementoStatusOperacao:
            'A emissão da Remessa foi Recusada pela CreditSec',
        });

        return;
      }
      return;
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        mensagem: 'Erro ao registrar retorno da CreditSec',
        acao: 'creditSecRemessaService.registrarRetornoCreditSec.catch',
        informacaoAdicional: { data, erro: error },
      });
    }
  }

  private async solicitarRemessaCreditSec(body: SolicitarRemessaType) {
    const req = await fetch(
      `${process.env.BASE_URL_CREDIT_SEC_SOLICITAR_REMESSA}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TOKEN_CREDIT_SEC_SOLICITAR_REMESSA}`,
        },
      },
    );

    if (!req.ok) {
      const erro = await req.json();
      const motivos = erro.errors[0].motivo_rejeicao as string[];
      const motivosConcatenado = motivos.reduce((acc, curr) => {
        return `${acc} | ${curr}`;
      }, '');
      await tratarErroRequisicao({
        status: req.status,
        acao: 'creditSecRemessaService.solicitarRemessaCreditSec',
        mensagem: `Erro ao criar remessa: ${motivosConcatenado}`,
        req,
        infoAdicional: {
          status: req.status,
          texto: req.statusText,
          erro,
          body,
          req,
        },
      });
    }

    const res = await req.json();

    return res;
  }

  async buscarStatusRemessa({
    numero_emissao,
    numero_remessa,
    numero_serie,
  }: Omit<NumerosSolicitarRemessa, 'data_operacao'>) {
    const req = await fetch(
      `${process.env.BASE_URL_CREDIT_SEC_SOLICITAR_REMESSA}?numero_remessa=${numero_remessa}&numero_serie=${numero_serie}&numero_emissao=${numero_emissao}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TOKEN_CREDIT_SEC_SOLICITAR_REMESSA}`,
        },
      },
    );
    if (!req.ok) {
      await tratarErroRequisicao({
        status: req.status,
        acao: 'creditSecRemessaService.buscarStatusRemessa',
        mensagem: `Erro ao buscar remessa: ${req.status} ${req.statusText}`,
        req,
        infoAdicional: {
          status: req.status,
          texto: req.statusText,
          emissao: numero_emissao,
          remessa: numero_remessa,
          serie: numero_serie,
        },
      });
    }
    const res = await req.json();

    return res;
  }

  private async encontrarOperacoesCedenteSigma(
    codigoOperacao: string,
  ): Promise<OperacaoCedente> {
    const req = await fetch(
      `${process.env.BASE_URL_OPERACOES_INVEST}fluxo-operacional/v1/operacoes-invest/${codigoOperacao}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );

    if (!req.ok) {
      await tratarErroRequisicao({
        status: req.status,
        acao: 'creditSecRemessaService.encontrarOperacoresCedenteSigma',
        mensagem: `Erro ao encontrar operações do cedente no sigma: ${req.status} ${req.statusText}`,
        req,
        infoAdicional: {
          status: req.status,
          texto: req.statusText,
          codigoOperacao,
          body: req.body,
        },
      });
    }

    const res = await req.json();
    return res;
  }

  private async criarRegistroDeOperacaoSigma(
    codigoOperacao: string,
    body: BodyCriarRegistroOperacao,
  ) {
    const req = await fetch(
      `${process.env.BASE_URL_CRIAR_REGISTRO_OPERACAO}/v1/operacoes-invest/${codigoOperacao}/analisar`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
        body: JSON.stringify(body),
      },
    );

    if (!req.ok) {
      await tratarErroRequisicao({
        status: req.status,
        acao: 'creditSecRemessaService.criarRegistroDeOperacaoSigma',
        mensagem: `Erro ao criar registro de operação no sigma: ${req.status} ${req.statusText}`,
        req,
        infoAdicional: {
          status: req.status,
          texto: req.statusText,
          codigoOperacao,
          body: req.body,
        },
      });
    }

    const res = { sucesso: true, codigoOperacao };
    return res;
  }

  private async destravarOperacaoDebentureSigma(codigoOperacao: string) {
    const req = await fetch(
      `${process.env.BASE_URL_ASSINATURA_DIGITAL}/operacoes/${codigoOperacao}/destravar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );
    if (!req.ok) {
      await tratarErroRequisicao({
        status: req.status,
        acao: 'creditSecRemessaService.encontrarOperacoresCedenteSigma',
        mensagem: `Erro ao destravar operacao debenture no sigma: ${req.status} ${req.statusText}`,
        req,
        infoAdicional: {
          codigoOperacao,
          status: req.status,
          texto: req.statusText,
          body: req.body,
        },
      });
    }

    const res = { sucesso: true, codigoOperacao };
    return res;
  }

  private async criarOperacaoDebentureCreditConnect(
    data: Omit<OperacaoDebentureSemVinculo, 'id'>,
  ) {
    const criarOperacaoDebenture =
      await this.operacaoDebentureRepositorio.criar(data);
    if (!criarOperacaoDebenture)
      throw new InternalServerErrorException(
        `Erro ao criar a operação debenture no Credit Connect`,
      );
    return criarOperacaoDebenture;
  }

  private async montarBodySolicitarRemessa(
    {
      numero_remessa,
      numero_emissao,
      numero_serie,
      data_operacao,
    }: NumerosSolicitarRemessa,
    dadosAtivo: AtivosInvest[],
  ): Promise<SolicitarRemessaType> {
    const isLocalhost = process.env.AMBIENTE === 'development';
    const baseUrl = isLocalhost
      ? 'http://srm-credit-connect-backend-nestjs-homologacao.interno.srmasset.com/'
      : process.env.BASE_URL;

    const promiseAtivos = dadosAtivo.map(async (ativo) => {
      const ccbAssinada = await this.ccbService.buscarCCBParaExternalizar(
        ativo.codigoAtivo,
      );
      const taxa_cessao =
        ativo.taxaAtivo === 'PRÉ'
          ? { tipo: 'prefixada', valor: ativo.tir }
          : {
              tipo: 'posfixada',
              valor: ativo.cdiInvestPercentual,
              indice: 'cdi',
            };
      return {
        numero: String(ativo.codigoAtivo),
        taxa_cessao,
        tipo: ativo.tipoAtivo,
        sacado: {
          cnpj: ativo.sacado.identificador,
          razao_social: ativo.sacado.nome,
          nome_fantasia: null,
        },
        data_emissao: data_operacao,
        lastro: {
          url: ccbAssinada,
        },
        parcelas: ativo.recebiveis.map((parcelas) => {
          return {
            data_vencimento: parcelas.dataVencimento,
            valor_face: parcelas.valorFuturo,
            valor_operado: parcelas.valorPresente,
          };
        }),
      };
    });
    const ativos = await Promise.all(promiseAtivos);
    return {
      numero_remessa: String(numero_remessa),
      numero_emissao,
      numero_serie,
      callback_url: `${baseUrl}api/credit-sec/solicitar-remessa/retorno/criacao-remessa`,
      titulos: ativos,
    };
  }
}
