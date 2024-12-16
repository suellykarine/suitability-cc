import { Injectable } from '@nestjs/common';
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

import { BodyRetornoCriacaoSerieDto } from './dto/serie-callback.dto';
import { SolicitarSerieType } from './interface/interface';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { statusRetornoCreditSecDicionario } from './const';
import {
  ErroAplicacao,
  ErroRequisicaoInvalida,
  ErroServidorInterno,
} from 'src/helpers/erroAplicacao';
import { LogService } from '../global/logs/log.service';
import { tratarErroRequisicao } from '../../utils/funcoes/tratarErro';
import { DebentureRepositorio } from 'src/repositorios/contratos/debentureRepositorio';

@Injectable()
export class CreditSecSerieService {
  private baseUrl: string;
  private tokenCreditSecSolicitarSerie: string;
  private baseUrlCreditSecSolicitarSerie: string;
  private baseUrlCadastroSigma: string;
  constructor(
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly logService: LogService,
    private readonly debentureSerieRepositorio: DebentureSerieRepositorio,
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
    private readonly configService: ConfigService,
    private readonly debentureRepositorio: DebentureRepositorio,
  ) {
    this.baseUrl = this.configService.get('BASE_URL');
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
        informacaoAdicional: {
          statusCreditSec,
        },
      });

      if (statusCreditSec.status === 'PENDING') return;

      return this.registrarRetornoCreditSec(statusCreditSec);
    } catch (error) {
      if (error instanceof ErroAplicacao) {
        const { acao, informacaoAdicional, message, ...erro } = error;
        await this.logService.aviso({
          acao,
          mensagem: message,
          informacaoAdicional: {
            ...informacaoAdicional,
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
        informacaoAdicional: {
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
        informacaoAdicional: {
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
        informacaoAdicional: {
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
        informacaoAdicional: {
          error,
        },
      });
    }
  }

  async solicitarSerie(debentureSerieInvestidorId: number) {
    try {
      const debentureSerieInvestidor =
        await this.debentureSerieInvestidorRepositorio.encontrarPorId(
          debentureSerieInvestidorId,
        );
      if (!debentureSerieInvestidor)
        throw new ErroRequisicaoInvalida({
          acao: 'creditSecSerieService.solicitarSerie',
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

      const bodySolicitarSerie = await this.montarBodySolicitarSerie(
        representanteCedente,
        enderecoCedente,
        fundoInvestidor,
        usuario,
        debentureSerieInvestidor,
      );

      try {
        await this.solicitarSerieCreditSec(bodySolicitarSerie);
        await this.debentureSerieInvestidorRepositorio.atualizar({
          id: debentureSerieInvestidor.id,
          status_retorno_creditsec: 'PENDENTE',
          mensagem_retorno_creditsec: null,
        });
      } catch (error) {
        await this.debentureSerieInvestidorRepositorio.atualizar({
          id: debentureSerieInvestidor.id,
          status_retorno_creditsec: 'ERRO',
          mensagem_retorno_creditsec: 'Falha ao cadastrar série no CreditSec',
        });
        if (error instanceof ErroAplicacao) throw error;
        throw new ErroServidorInterno({
          acao: 'creditSecSerieService.solicitarSerie',
          mensagem: 'Erro ao solicitar série no CreditSec',
          informacaoAdicional: {
            bodySolicitarSerie,
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
        informacaoAdicional: {
          debentureSerieInvestidorId,
          error,
        },
      });
    }
  }
  async registrarRetornoCreditSec(data: BodyRetornoCriacaoSerieDto) {
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
        informacaoAdicional: {
          data,
          debentureSerie,
          ultimoVinculoDSI,
        },
      });

      const status = statusRetornoCreditSecDicionario[data.status] ?? 'ERRO';

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
          informacaoAdicional: {
            data,
            debentureSerieInvestidorAtualizado,
            debentureSerieAtualizado,
            retornoCreditSec: data,
          },
        });
      }

      if (status === 'REPROVADO') {
        const fundoDesvinculado = await this.desvincularFundoInvestimento(
          ultimoVinculoDSI.id_fundo_investimento,
        );
        await this.logService.info({
          acao: 'creditSecSerieService.registrarRetornoCreditSec.reprovado',
          mensagem: 'Retorno CreditSec de REPROVACÃO registrado com sucesso',
          informacaoAdicional: {
            data,
            fundoDesvinculado,
            ultimoVinculoDSI,
            retornoCreditSec: data,
          },
        });
      }

      return debentureSerieInvestidorAtualizado;
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        acao: 'creditSecSerieService.registrarRetornoCreditSec.catch',
        mensagem: 'Erro ao registrar retorno do CreditSec',
        informacaoAdicional: {
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
  ): Promise<BodyRetornoCriacaoSerieDto> {
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
      status: req.status,
      acao: 'creditSecSerieService.buscarStatusSerieCreditSec',
      mensagem: `Erro ao buscar serie: ${req.status} ${req.statusText}`,
      req,
      infoAdicional: {
        status: req.status,
        texto: req.statusText,
        body: req.body,
        numero_emissao,
        numero_serie,
        url: req.url,
      },
    });
  }
  private async solicitarSerieCreditSec(body: SolicitarSerieType) {
    try {
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
          informacaoAdicional: {
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
        informacaoAdicional: {
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
        informacaoAdicional: {
          body,
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
      status: req.status,
      acao: 'creditSecSerieService.buscarCedenteSigma',
      mensagem: `Erro ao buscar cedente no sigma: ${req.status} ${req.statusText}`,
      req,
      infoAdicional: {
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
    const objSolicitarSerie: SolicitarSerieType = {
      numero_emissao:
        debentureSerieInvestidor.debenture_serie.debenture.numero_debenture,
      numero_serie: debentureSerieInvestidor.debenture_serie.numero_serie,
      callback_url: `${this.baseUrl}api/credit-sec/solicitar-serie/retorno/criacao-serie`,
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
