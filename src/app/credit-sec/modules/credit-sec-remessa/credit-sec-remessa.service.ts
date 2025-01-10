import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { sigmaHeaders } from 'src/app/autenticacao/constants';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';

import { Cron } from '@nestjs/schedule';
import { OperacaoDebentureRepositorio } from 'src/repositorios/contratos/operacaoDebentureRepositorio';

import { OperacaoDebentureSemVinculo } from 'src/@types/entities/operacaoDebenture';

import {
  ErroAplicacao,
  ErroRequisicaoInvalida,
  ErroServidorInterno,
} from 'src/helpers/erroAplicacao';

import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import { SigmaService } from 'src/app/sigma/sigma.service';
import { DebentureSerieService } from 'src/app/debentures/debentures-serie.service';
import { PagamentoOperacaoService } from 'src/app/sigma/sigma.pagamentoOperacao.service';
import { OperacoesInvestService } from 'src/app/operacoes-invest/operacoes-invest.service';
import { LogService } from 'src/app/global/logs/log.service';
import { CcbService } from 'src/app/ccb/ccb.service';
import {
  EmissaoRemessaDto,
  EmissaoRemessaRetornoDto,
} from './dto/remessa-callback.dto';
import {
  BodyCriarRegistroOperacao,
  SolicitarRemessaType,
} from '../../interface/interface';
import { statusRetornoCreditSecDicionario } from '../../const';
import { tratarErroRequisicao } from 'src/utils/funcoes/erros';
import { OperacaoInvest } from 'src/@types/entities/operacao';

@Injectable()
export class CreditSecRemessaService {
  constructor(
    private readonly sigmaService: SigmaService,
    private readonly logService: LogService,
    private readonly ccbService: CcbService,
    private readonly adaptadorDb: AdaptadorDb,
    @Inject(forwardRef(() => DebentureSerieService))
    private readonly debentureSerieService: DebentureSerieService,
    private readonly pagamentoOperacaoService: PagamentoOperacaoService,
    private readonly operacaoInvestService: OperacoesInvestService,
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly debentureSerieRepositorio: DebentureSerieRepositorio,
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
    private readonly operacaoDebentureRepositorio: OperacaoDebentureRepositorio,
  ) {}
  @Cron('0 0 10 * * 1-5')
  async buscarStatusSolicitacaoRemessa() {
    try {
      const remessasPendentes =
        await this.operacaoDebentureRepositorio.buscarOperacoesPeloStatusCreditSec(
          'PENDENTE',
        );

      for (const remessa of remessasPendentes) {
        const debentureSerieInvestidor =
          await this.debentureSerieInvestidorRepositorio.encontrarPorId(
            remessa.id_debenture_serie_investidor,
          );
        const debentureSerie = debentureSerieInvestidor.debenture_serie;
        const debenture = debentureSerieInvestidor.debenture_serie.debenture;

        const buscarStatusRemessa = await this.buscarStatusRemessa({
          numeroDebenture: debenture.numero_debenture,
          codigoOperacao: String(remessa.codigo_operacao),
          numeroSerie: debentureSerie.numero_serie,
        });

        await this.registrarRetornoCreditSec(buscarStatusRemessa);
      }
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        acao: 'creditSecRemessa.buscarStatusSolicitacaoRemessa',
        mensagem: `Erro ao buscar status solicitação da remessa`,
        detalhes: {
          error,
        },
      });
    }
  }

  @Cron('0 0 10 * * 1-5')
  async repetirSolicitacaoRemessaComErro() {
    try {
      const operacoesComErro =
        await this.operacaoDebentureRepositorio.buscarOperacoesPeloStatusCreditSec(
          'ERRO',
        );

      for (const operacao of operacoesComErro) {
        const debentureSerieInvestidor =
          await this.debentureSerieInvestidorRepositorio.encontrarPorId(
            operacao.id_debenture_serie_investidor,
          );
        const debentureSerie = debentureSerieInvestidor.debenture_serie;
        const numeroSerie = debentureSerie.numero_serie;
        const numeroDebenture = debentureSerie.debenture.numero_debenture;
        try {
          await this.solicitarRemessaCreditSec({
            numeroDebenture,
            numeroSerie,
            codigoOperacao: String(operacao.codigo_operacao),
          });
          await this.operacaoDebentureRepositorio.atualizar(operacao.id, {
            status_retorno_creditsec: 'PENDENTE',
          });
        } catch (erro) {
          if (erro instanceof ErroAplicacao) throw erro;
          throw new ErroServidorInterno({
            acao: 'creditSecRemessa.repetirSolicitacaoRemessaComErro',
            mensagem:
              'Erro ao refazer solicitao da remessa com erro no CreditSec',
            detalhes: {
              operacao,
              erroMensagem: erro.message,
              erro,
            },
          });
        }
      }
      return { operacoesSelecionadas: operacoesComErro };
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        acao: 'creditSecRemessa.buscarStatusSolicitacaoRemessa',
        mensagem: `Erro ao re-emitir as solicitações da remessas com erro`,
        detalhes: {
          error,
        },
      });
    }
  }

  async solicitarRemessa(data: EmissaoRemessaDto) {
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

      const ehDSILiberada =
        debentureSerieInvestidor.status_retorno_creditsec === 'LIBERADO';

      const operacaoCedente = await this.encontrarOperacoesCedenteSigma(
        String(data.codigo_operacao),
      );

      const operacaoDebenture = await this.adaptadorDb.fazerTransacao(
        async () => {
          await this.debentureSerieService.registroBaixaValorSerie(
            debenture_serie.id,
            operacaoCedente.valorLiquido,
          );

          const statusRetornoCreditSec = ehDSILiberada
            ? 'AGUARDANDO_LIBERACAO'
            : 'PENDENTE';

          const operacaoDebenture =
            await this.criarOperacaoDebentureCreditConnect({
              codigo_operacao: data.codigo_operacao,
              status_retorno_creditsec: statusRetornoCreditSec,
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

          if (ehDSILiberada) {
            await this.solicitarRemessaCreditSec({
              numeroDebenture: data.numero_debenture,
              numeroSerie: data.numero_serie,
              codigoOperacao: String(data.codigo_operacao),
            });
          }

          return operacaoDebenture;
        },
        [this.operacaoDebentureRepositorio, this.debentureSerieRepositorio],
        { timeout: 80000 }, // TO-KNOW: Timeout de 80 segundos devido a lentidão do SIGMA, tentar tratar isso posteriormente com a respectiva equipe
      );

      return {
        sucesso: true,
        operacao: operacaoCedente.codigoOperacao,
        data: operacaoDebenture,
      };
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        mensagem: 'Erro ao solicitar remessa',
        acao: 'creditSecRemessaService.solicitarRemessa',
        detalhes: { data, erro: error },
      });
    }
  }
  async registrarRetornoCreditSec(data: EmissaoRemessaRetornoDto) {
    try {
      const operacao =
        await this.operacaoDebentureRepositorio.buscarOperacaoPeloCodigoOperacao(
          data.numero_remessa,
        );

      if (!operacao) {
        throw new ErroRequisicaoInvalida({
          acao: 'creditSecRemessaService.registrarRetornoCreditSec',
          mensagem: 'Operação não encontrada',
          detalhes: {
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
          detalhes: {
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
          detalhes: { data },
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
          detalhes: {
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

        await this.adaptadorDb.fazerTransacao(async () => {
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
        }, [this.debentureSerieRepositorio, this.operacaoDebentureRepositorio]);

        return;
      }
      return;
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        mensagem: 'Erro ao registrar retorno da CreditSec',
        acao: 'creditSecRemessaService.registrarRetornoCreditSec.catch',
        detalhes: { data, erro: error.message },
      });
    }
  }

  async solicitarRemessaCreditSec({
    codigoOperacao,
    numeroDebenture,
    numeroSerie,
  }: {
    numeroDebenture: number;
    numeroSerie: number;
    codigoOperacao: string;
  }) {
    try {
      const { dataOperacao } = await this.encontrarOperacoesCedenteSigma(
        String(codigoOperacao),
      );
      const body = await this.montarBodySolicitarRemessa({
        numeroDebenture,
        numeroSerie,
        codigoOperacao,
        dataOperacao,
      });
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
        const motivosConcatenado = motivos.join(' | ');
        await tratarErroRequisicao({
          acao: 'creditSecRemessaService.solicitarRemessaCreditSec.tratarErroReq',
          mensagem: `Erro ao criar remessa: ${motivosConcatenado}`,
          req,
          detalhes: {
            erro,
            body,
            req,
          },
        });
      }

      const res = await req.json();

      return res;
    } catch (error) {
      await this.sigmaService.excluirOperacaoDebentureSigma({
        codigoOperacao,
        complementoStatusOperacao:
          'A emissão da Remessa não foi realizada pela CreditSec',
      });

      if (error instanceof ErroAplicacao) {
        const { message, acao, detalhes, ...erro } = error;
        throw new ErroServidorInterno({
          mensagem: message,
          acao:
            acao +
            ' | ' +
            'creditSecRemessaService.solicitarRemessa.creditSec.catch',
          detalhes: {
            ...detalhes,
            erro,
          },
        });
      }
      throw new ErroServidorInterno({
        mensagem: 'Erro ao solicitar remessa',
        acao: 'creditSecRemessaService.solicitarRemessa.creditSec.catch.desconhecido',
        detalhes: { stack: error.stack, erro: error.message, codigoOperacao },
      });
    }
  }

  async buscarStatusRemessa({
    numeroDebenture,
    codigoOperacao,
    numeroSerie,
  }: {
    numeroDebenture: number;
    codigoOperacao: string;
    numeroSerie: number;
  }) {
    const req = await fetch(
      `${process.env.BASE_URL_CREDIT_SEC_SOLICITAR_REMESSA}?numero_remessa=${codigoOperacao}&numero_serie=${numeroSerie}&numero_emissao=${numeroDebenture}`,
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
        acao: 'creditSecRemessaService.buscarStatusRemessa',
        mensagem: `Erro ao buscar remessa: ${req.status} ${req.statusText}`,
        req,
        detalhes: {
          status: req.status,
          texto: req.statusText,
          emissao: numeroDebenture,
          remessa: codigoOperacao,
          serie: numeroSerie,
        },
      });
    }
    const res = await req.json();

    return res;
  }

  private async encontrarOperacoesCedenteSigma(
    codigoOperacao: string,
  ): Promise<OperacaoInvest> {
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
        acao: 'creditSecRemessaService.encontrarOperacoresCedenteSigma',
        mensagem: `Erro ao encontrar operações do cedente no sigma: ${req.status} ${req.statusText}`,
        req,
        detalhes: {
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
        acao: 'creditSecRemessaService.criarRegistroDeOperacaoSigma',
        mensagem: `Erro ao criar registro de operação no sigma: ${req.status} ${req.statusText}`,
        req,
        detalhes: {
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
        acao: 'creditSecRemessaService.encontrarOperacoresCedenteSigma',
        mensagem: `Erro ao destravar operacao debenture no sigma: ${req.status} ${req.statusText}`,
        req,
        detalhes: {
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

  private async montarBodySolicitarRemessa({
    codigoOperacao,
    numeroDebenture,
    numeroSerie,
    dataOperacao,
  }: {
    codigoOperacao: string;
    numeroDebenture: number;
    numeroSerie: number;
    dataOperacao: string;
  }): Promise<SolicitarRemessaType> {
    const isLocalhost = process.env.AMBIENTE === 'development';
    const baseUrlSrmWebhooks = isLocalhost
      ? 'https://srm-webhooks-homologacao.srmasset.com/api' // TO-DO: Confirmar se será esse a URL final
      : process.env.BASE_URL_SRM_WEBHOOKS;

    try {
      const { ativosInvest } =
        await this.encontrarOperacoesCedenteSigma(codigoOperacao);

      const promiseAtivos = ativosInvest.map(async (ativo) => {
        const ccbAssinada = await this.ccbService.buscarCCBParaExternalizar(
          1364997, // TO-DO: Retirar hard coded, retornar utilizando ativo.codigoAtivo,
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
          tipo: 'ccb', // TO-DO: voltar para o padrão: ativo.tipoAtivo,
          sacado: {
            cnpj: ativo.sacado.identificador,
            razao_social: ativo.sacado.nome,
            nome_fantasia: null,
          },
          data_emissao: dataOperacao,
          lastro: {
            url: ccbAssinada.url,
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
        codigoOperacao: String(codigoOperacao),
        numero_emissao: numeroDebenture,
        numero_serie: numeroSerie,
        callback_url: `${baseUrlSrmWebhooks}/credit-connect/credit-sec/remessa/emissao/retorno`,
        titulos: ativos,
      };
    } catch (erro) {
      if (erro instanceof ErroAplicacao) throw erro;
      throw new ErroServidorInterno({
        mensagem: 'Erro ao montar body solicitar remessa',
        acao: 'creditSecRemessaService.montarBodySolicitarRemessa.catch',
        detalhes: {
          erro: erro.message,
          stack: erro.stack,
          codigoOperacao,
          numeroDebenture,
          numeroSerie,
          dataOperacao,
        },
      });
    }
  }
}
