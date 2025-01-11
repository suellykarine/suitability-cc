import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cedente } from 'src/@types/entities/cedente';
import { EnderecoCedente } from 'src/@types/entities/cedente';
import { DebentureSerieInvestidor } from 'src/@types/entities/debenture';
import {
  FundoInvestimento,
  RepresentanteFundo,
} from 'src/@types/entities/fundos';
import { Usuario } from 'src/@types/entities/usuario';

import { sigmaHeaders } from 'src/app/autenticacao/constants';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';

import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import {
  ErroAplicacao,
  ErroRequisicaoInvalida,
  ErroServidorInterno,
} from 'src/helpers/erroAplicacao';
import { DebentureRepositorio } from 'src/repositorios/contratos/debentureRepositorio';
import { OperacaoDebentureRepositorio } from 'src/repositorios/contratos/operacaoDebentureRepositorio';
import { LogService } from 'src/app/global/logs/log.service';
import { EmissaoSerieRetornoDto } from './dto/serie-callback.dto';
import { statusRetornoCreditSecDicionario } from '../../const';
import { tratarErroRequisicao } from 'src/utils/funcoes/erros';
import { SolicitarSerieType } from '../../interface/interface';
import { CreditSecRemessaService } from '../credit-sec-remessa/credit-sec-remessa.service';

@Injectable()
export class CreditSecSerieService {
  private tokenCreditSecSolicitarSerie: string;
  private baseUrlCreditSecSolicitarSerie: string;
  private baseUrlCadastroSigma: string;
  constructor(
    @Inject(forwardRef(() => CreditSecRemessaService))
    private readonly creditSecRemessaService: CreditSecRemessaService,
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly logService: LogService,
    private readonly debentureSerieRepositorio: DebentureSerieRepositorio,
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
    private readonly configService: ConfigService,
    private readonly debentureRepositorio: DebentureRepositorio,
    private readonly operacaoDebentureRepositorio: OperacaoDebentureRepositorio,
  ) {
    this.tokenCreditSecSolicitarSerie = this.configService.get(
      'TOKEN_CREDIT_SEC_SOLICITAR_SERIE',
    );
    this.baseUrlCreditSecSolicitarSerie = this.configService.get(
      'BASE_URL_CREDIT_SEC_SOLICITAR_SERIE',
    );
    this.baseUrlCadastroSigma = this.configService.get(
      'BASE_URL_CADASTRO_CEDENTE_SIGMA',
    );
  }

  private async atualizarStatusCreditSec({
    numeroDebenture,
    numeroSerie,
  }: {
    numeroDebenture: number;
    numeroSerie: number;
  }) {
    try {
      const statusCreditSec = await this.buscarStatusSerieCreditSec(
        numeroDebenture,
        numeroSerie,
      );
      await this.logService.info({
        acao: 'creditSecSerieService.atualizarStatusCreditSec',
        mensagem: 'Status CreditSec encontrado',
        detalhes: {
          statusCreditSec,
        },
      });

      if (statusCreditSec.status === 'PENDING') return;

      return this.registrarRetornoCreditSec(statusCreditSec);
    } catch (error) {
      if (error instanceof ErroAplicacao) {
        const { acao, detalhes, message, ...erro } = error;
        await this.logService.aviso({
          acao,
          mensagem: message,
          detalhes: {
            ...detalhes,
            erro,
            numeroDebenture,
            numeroSerie,
            error,
          },
        });
        return;
      }
      throw new ErroServidorInterno({
        acao: 'creditSecSerieService.atualizarStatusCreditSec.catch',
        mensagem: 'Erro ao buscar status de solicitação de série',
        detalhes: {
          numeroDebenture,
          numeroSerie,
          error,
        },
      });
    }
  }

  @Cron('0 8-20/2 * * 1-5', {
    name: 'validarStatusJob',
    timeZone: 'America/Sao_Paulo',
  })
  async buscarStatusSolicitacaoSerie() {
    try {
      await this.logService.info({
        mensagem: 'Executando validação de status dos investidores.',
        acao: 'creditSecSerieService.buscarStatusSolicitacaoSerie.cronjob',
        exibirNoConsole: true,
        detalhes: {
          configuracaoCronjob: {
            nome: 'validarStatusJob',
            timeZone: 'America/Sao_Paulo',
            programacaoHorario: '0 8-20/2 * * 1-5',
            dataSistema: new Date(),
          },
        },
      });
      const debentureAtiva = await this.debentureRepositorio.buscarAtiva();
      const debentureSerieInvestidorPendentes =
        await this.debentureSerieInvestidorRepositorio.buscarDSIPendenteCreditSec(
          debentureAtiva.id,
        );
      await this.logService.info({
        mensagem: 'Investidores com status creditsec pendente encontrados.',
        acao: 'creditSecSerieService.buscarStatusSolicitacaoSerie.cronjob.pendentes',
        detalhes: {
          debentureSerieInvestidorPendentes,
        },
      });
      const todasSeriesAtualizadas = await Promise.all(
        debentureSerieInvestidorPendentes.map(
          async ({ debenture_serie: debentureSerie }) => {
            const numeroDebenture = debentureSerie.debenture.numero_debenture;
            const numeroSerie = debentureSerie.numero_serie;

            return await this.atualizarStatusCreditSec({
              numeroDebenture,
              numeroSerie,
            });
          },
        ),
      );
      return todasSeriesAtualizadas;
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        acao: 'creditSecSerieService.buscarStatusSolicitacaoSerie',
        mensagem: 'Erro ao buscar status de solicitação de série',
        detalhes: {
          error,
        },
      });
    }
  }

  async solicitarSerie(debentureSerieInvestidorId: number) {
    try {
      try {
        await this.solicitarSerieCreditSec(debentureSerieInvestidorId);
        await this.debentureSerieInvestidorRepositorio.atualizar({
          id: debentureSerieInvestidorId,
          status_retorno_creditsec: 'PENDENTE',
          mensagem_retorno_creditsec: null,
        });
      } catch (error) {
        await this.debentureSerieInvestidorRepositorio.atualizar({
          id: debentureSerieInvestidorId,
          status_retorno_creditsec: 'ERRO',
          mensagem_retorno_creditsec:
            'Falha ao cadastrar série no CreditSec, Mensagem:' + error.message,
        });
        if (error instanceof ErroAplicacao) throw error;
        throw new ErroServidorInterno({
          acao: 'creditSecSerieService.solicitarSerie',
          mensagem: 'Erro ao solicitar série no CreditSec',
          detalhes: {
            debentureSerieInvestidorId,
            error,
          },
        });
      }

      return;
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        acao: 'creditSecSerieService.solicitarSerie',
        mensagem: 'Erro ao solicitar série no CreditSec',
        detalhes: {
          debentureSerieInvestidorId,
          error,
        },
      });
    }
  }
  async registrarRetornoCreditSec(data: EmissaoSerieRetornoDto) {
    try {
      const debentureSerie =
        await this.debentureSerieRepositorio.encontrarSeriePorNumeroEmissaoNumeroSerie(
          +data.numero_emissao,
          +data.numero_serie,
        );
      const ultimoVinculoDSI =
        await this.debentureSerieInvestidorRepositorio.encontrarMaisRecentePorIdDebentureSerie(
          debentureSerie.id,
        );
      await this.logService.info({
        acao: 'creditSecSerieService.registrarRetornoCreditSec.ultimoVinculoDSI',
        mensagem: 'Registrando retorno CreditSec no ultimo vinculo DSI',
        detalhes: {
          data,
          debentureSerie,
          ultimoVinculoDSI,
        },
      });

      const status = statusRetornoCreditSecDicionario[data.status] ?? 'ERRO';
      const ehDSILiberada =
        ultimoVinculoDSI.status_retorno_creditsec === 'LIBERADO';

      const dataDesvinculo = status === 'REPROVADO' ? new Date() : null;
      const ehStatusErro = status === 'ERRO';
      const debentureSerieInvestidorAtualizado =
        await this.debentureSerieInvestidorRepositorio.atualizar({
          data_desvinculo: dataDesvinculo,
          id: ultimoVinculoDSI.id,
          mensagem_retorno_creditsec:
            data.motivo ??
            (ehStatusErro ? 'Erro não informado ao salvar retorno' : null),
          status_retorno_creditsec: status,
        });

      if (status === 'APROVADO') {
        const debentureSerieAtualizado = await this.registrarDataEmissaoSerie(
          debentureSerie.id,
        );
        await this.logService.info({
          acao: 'creditSecSerieService.registrarRetornoCreditSec.aprovado',
          mensagem: 'Retorno CreditSec de APROVACÃO registrado com sucesso',
          detalhes: {
            data,
            debentureSerieInvestidorAtualizado,
            debentureSerieAtualizado,
            retornoCreditSec: data,
          },
        });

        if (ehDSILiberada) {
          const operacoesDebentures = ultimoVinculoDSI.operacao_debenture;
          const debentureSerie = ultimoVinculoDSI.debenture_serie;
          const numeroDebenture = debentureSerie.debenture.numero_debenture;
          const numeroSerie = debentureSerie.numero_serie;

          for (const operacao of operacoesDebentures) {
            try {
              await this.creditSecRemessaService.solicitarRemessaCreditSec({
                numeroDebenture,
                numeroSerie,
                codigoOperacao: String(operacao.codigo_operacao),
              });
            } catch (erro) {
              const { message } = erro;
              await this.operacaoDebentureRepositorio.atualizar(operacao.id, {
                status_retorno_creditsec: 'ERRO',
                mensagem_retorno_creditsec: message,
              });

              {
                this.logService.erro({
                  acao: 'creditSecSerieService.registrarRetornoCreditSec.aprovado.dsiLiberado.catch',
                  mensagem: 'Erro ao solicitar remessa no CreditSec',
                  detalhes: {
                    operacao,
                    erroMensagem: erro.mensagem ?? erro.message,
                    erro,
                  },
                });
              }
            }
          }
        }
      }

      if (status === 'REPROVADO') {
        const fundoDesvinculado = await this.desvincularFundoInvestimento(
          ultimoVinculoDSI.id_fundo_investimento,
        );
        await this.logService.info({
          acao: 'creditSecSerieService.registrarRetornoCreditSec.reprovado',
          mensagem: 'Retorno CreditSec de REPROVACÃO registrado com sucesso',
          detalhes: {
            data,
            fundoDesvinculado,
            ultimoVinculoDSI,
            retornoCreditSec: data,
          },
        });

        if (ehDSILiberada) {
          const operacoesDebentures = ultimoVinculoDSI.operacao_debenture;

          for (const operacao of operacoesDebentures) {
            await this.operacaoDebentureRepositorio.atualizar(operacao.id, {
              status_retorno_creditsec: 'REPROVADO',
              mensagem_retorno_creditsec:
                'A serie vinculada a essa operacao foi reprovada',
            });
          }
        }
      }

      return debentureSerieInvestidorAtualizado;
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        acao: 'creditSecSerieService.registrarRetornoCreditSec.catch',
        mensagem: 'Erro ao registrar retorno do CreditSec',
        detalhes: {
          data,
          retornoCreditSec: data,
          error,
        },
      });
    }
  }

  private async registrarDataEmissaoSerie(id_debenture_serie: number) {
    const dataAtual = new Date();
    const dataVencimento = new Date();
    dataVencimento.setMonth(dataAtual.getMonth() + 6);

    const debentureSerieAtualizado =
      await this.debentureSerieRepositorio.atualizar(id_debenture_serie, {
        data_emissao: dataAtual,
        data_vencimento: dataVencimento,
      });
    return debentureSerieAtualizado;
  }

  private async desvincularFundoInvestimento(id_fundo: number) {
    const fundoDesvinculado =
      await this.fundoInvestimentoRepositorio.atualizaAptoDebentureEvalorSerie({
        apto_debenture: false,
        id_fundo: id_fundo,
        valor_serie_debenture: null,
      });
    return fundoDesvinculado;
  }

  private async buscarStatusSerieCreditSec(
    numero_emissao: number,
    numero_serie: number,
  ): Promise<EmissaoSerieRetornoDto> {
    const req = await fetch(
      `${this.baseUrlCreditSecSolicitarSerie}/serie/solicitar_emissao?numero_emissao=${numero_emissao}&numero_serie=${numero_serie}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.tokenCreditSecSolicitarSerie}`,
        },
      },
    );

    if (req.ok) return await req.json();
    await tratarErroRequisicao({
      acao: 'creditSecSerieService.buscarStatusSerieCreditSec',
      mensagem: `Erro ao buscar serie: ${req.status} ${req.statusText}`,
      req,
      detalhes: {
        status: req.status,
        texto: req.statusText,
        body: req.body,
        numero_emissao,
        numero_serie,
        url: req.url,
      },
    });
  }
  private async solicitarSerieCreditSec(debentureSerieInvestidorId: number) {
    try {
      const debentureSerieInvestidor =
        await this.debentureSerieInvestidorRepositorio.encontrarPorId(
          debentureSerieInvestidorId,
        );
      if (!debentureSerieInvestidor)
        throw new ErroRequisicaoInvalida({
          acao: 'creditSecSerieService.solicitarSerieCreditSec',
          mensagem: 'Debenture Serie Investidor não encontrado',
        });

      const usuario =
        debentureSerieInvestidor.fundo_investimento
          .fundo_investimento_gestor_fundo?.[0].usuario_fundo_investimento?.[0]
          .usuario;
      const fundoInvestidor = debentureSerieInvestidor.fundo_investimento;
      const cedenteSigma = await this.buscarCedenteSigma(
        fundoInvestidor.cpf_cnpj,
      );
      const enderecoCedente = cedenteSigma.endereco;
      const representanteCedente = fundoInvestidor.representante_fundo;

      const body = await this.montarBodySolicitarSerie(
        representanteCedente,
        enderecoCedente,
        fundoInvestidor,
        usuario,
        debentureSerieInvestidor,
      );

      const url = `${this.baseUrlCreditSecSolicitarSerie}/serie/solicitar_emissao`;
      const req = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.tokenCreditSecSolicitarSerie}`,
        },
      });
      if (req.ok) {
        this.logService.info({
          acao: 'creditSecSerieService.solicitarSerieCreditSec',
          mensagem: 'Série solicitada com sucesso no CreditSec',
          detalhes: {
            url,
            req,
            body,
          },
        });
        return;
      }

      const creditSecData = await req.json();
      throw new ErroServidorInterno({
        acao: 'creditSecSerieService.solicitarSerieCreditSec',
        mensagem: 'Erro ao solicitar série no CreditSec: ' + creditSecData[0],
        detalhes: {
          url,
          req,
          body,
          creditSecData,
        },
      });
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;

      throw new ErroServidorInterno({
        acao: 'creditSecSerieService.solicitarSerieCreditSec',
        mensagem: 'Erro ao solicitar série no CreditSec',
        detalhes: {
          debentureSerieInvestidorId,
          error,
        },
      });
    }
  }

  private async buscarCedenteSigma(identificador: string): Promise<Cedente> {
    const req = await fetch(`${this.baseUrlCadastroSigma}/${identificador}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': sigmaHeaders['X-API-KEY'],
      },
    });
    const response = await req.json();

    if (req.ok) return response;
    await tratarErroRequisicao({
      acao: 'creditSecSerieService.buscarCedenteSigma',
      mensagem: `Erro ao buscar cedente no sigma: ${req.status} ${req.statusText}`,
      req,
      detalhes: {
        status: req.status,
        texto: req.statusText,
        identificador,
        url: req.url,
      },
    });
  }

  private async montarBodySolicitarSerie(
    representanteCedente: RepresentanteFundo,
    enderecoCedente: EnderecoCedente,
    cedenteCreditConnect: FundoInvestimento,
    usuario: Omit<Usuario, 'tipo_usuario'>,
    debentureSerieInvestidor: DebentureSerieInvestidor,
  ) {
    const isLocalhost = process.env.AMBIENTE === 'development';
    const baseUrlSrmWebhooks = isLocalhost
      ? 'https://srm-webhooks-homologacao.srmasset.com/api' // TO-DO: Confirmar se será esse a URL final
      : process.env.BASE_URL_SRM_WEBHOOKS;

    const objSolicitarSerie: SolicitarSerieType = {
      numero_emissao:
        debentureSerieInvestidor.debenture_serie.debenture.numero_debenture,
      numero_serie: debentureSerieInvestidor.debenture_serie.numero_serie,
      callback_url: `${baseUrlSrmWebhooks}/credit-connect/credit-sec/serie/emissao/retorno`,
      conta_serie: {
        banco: '533',
        agencia: debentureSerieInvestidor.conta_investidor.agencia,
        conta: debentureSerieInvestidor.conta_investidor.conta,
        digito: debentureSerieInvestidor.conta_investidor.conta_digito,
      },
      debenturista: {
        cnpj: cedenteCreditConnect.cpf_cnpj,
        razao_social: cedenteCreditConnect.razao_social,
        nome_fantasia: cedenteCreditConnect.nome_fantasia,
        endereco: {
          cep: enderecoCedente.cep,
          uf: enderecoCedente.uf,
          cidade: enderecoCedente.cidade,
          bairro: enderecoCedente.bairro,
          logradouro: enderecoCedente.logradouro,
          complemento: enderecoCedente.complemento,
          numero: enderecoCedente.numero,
        },
        contato: {
          email: usuario.email,
          telefone: usuario.telefone,
          nome: usuario.nome,
        },
      },
      representantes: [
        {
          cpf: representanteCedente.cpf,
          email: representanteCedente.email,
          nome: representanteCedente.nome,
          telefone: representanteCedente.telefone,
        },
      ],
      valor_total_integralizado:
        +debentureSerieInvestidor.debenture_serie.valor_serie,
    };
    return objSolicitarSerie;
  }
}
