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
import { FundoInvestimentoGestorFundoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoGestorFundoRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { UsuarioFundoInvestimentoRepositorio } from 'src/repositorios/contratos/usuarioFundoInvestimentoRepositorio';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';
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

@Injectable()
export class CreditSecSerieService {
  private baseUrl: string;
  private tokenCreditSecSolicitarSerie: string;
  private baseUrlCreditSecSolicitarSerie: string;
  private baseUrlCadastroSigma: string;
  constructor(
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly fundoInvestimentoGestorFundoRepositorio: FundoInvestimentoGestorFundoRepositorio,
    private readonly usuarioFundoInvestimentoRepositorio: UsuarioFundoInvestimentoRepositorio,
    private readonly usuarioRepositorio: UsuarioRepositorio,
    private readonly logService: LogService,
    private readonly debentureSerieRepositorio: DebentureSerieRepositorio,
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
    private readonly configService: ConfigService,
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
    const statusCreditSec = await this.buscarStatusSerieCreditSec(
      numeroDebenture,
      numeroSerie,
    );

    if (statusCreditSec.status === 'PENDING') return;

    return this.registrarRetornoCreditSec(statusCreditSec);
  }

  @Cron('0 0 10 * * 1-5')
  async buscarStatusSolicitacaoSerie() {
    try {
      const debentureSerieInvestidorPendentes =
        await this.debentureSerieInvestidorRepositorio.todosStatusCreditSecNull();

      const todasSeriesAtualizadas = await Promise.all(
        debentureSerieInvestidorPendentes.map(
          async ({ debenture_serie: debentureSerie }) => {
            const numeroDebenture = debentureSerie.debenture.numero_debenture;
            const numeroSerie = debentureSerie.numero_serie;

            return this.atualizarStatusCreditSec({
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
        erro: error.message,
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
          erro: error.message,
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
        erro: error.message,
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
        await this.debentureSerieRepositorio.encontrarSeriePorNumeroSerie(
          +data.numero_serie,
        );
      const ultimoVinculoDSI =
        await this.debentureSerieInvestidorRepositorio.encontrarMaisRecentePorIdDebentureSerie(
          debentureSerie.id,
        );

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
        await this.registrarDataEmissaoSerie(debentureSerie.id);
        this.logService.info({
          acao: 'creditSecSerieService.registrarRetornoCreditSec',
          mensagem: 'Retorno CreditSec de APROVACÃO registrado com sucesso',
          informacaoAdicional: {
            data,
            retornoCreditSec: data,
          },
        });
      }

      if (status === 'REPROVADO') {
        await this.desabilitarDebentureFundoInvestimento(
          ultimoVinculoDSI.id_fundo_investimento,
        );
        this.logService.info({
          acao: 'creditSecSerieService.registrarRetornoCreditSec',
          mensagem: 'Retorno CreditSec de REPROVACÃO registrado com sucesso',
          informacaoAdicional: {
            data,
            retornoCreditSec: data,
          },
        });
      }

      return debentureSerieInvestidorAtualizado;
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        acao: 'creditSecSerieService.registrarRetornoCreditSec',
        mensagem: 'Erro ao registrar retorno do CreditSec',
        erro: error.message,
        informacaoAdicional: {
          data,
          error,
          retornoCreditSec: data,
        },
      });
    }
  }

  private async registrarDataEmissaoSerie(id_debenture_serie: number) {
    const dataAtual = new Date();
    const dataVencimento = new Date();
    dataVencimento.setMonth(dataAtual.getMonth() + 6);

    const debentureSerieAtualizado =
      await this.debentureSerieRepositorio.atualizaDatasDebentureSerie({
        data_emissao: dataAtual,
        data_vencimento: dataVencimento,
        id_debenture_serie,
      });
    return debentureSerieAtualizado;
  }

  private async desabilitarDebentureFundoInvestimento(id_fundo: number) {
    const desabilitaDebenture =
      await this.fundoInvestimentoRepositorio.atualizaAptoDebentureEvalorSerie({
        apto_debenture: false,
        id_fundo: id_fundo,
        valor_serie_debenture: null,
      });
    return desabilitaDebenture;
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
    throw new ErroServidorInterno({
      acao: 'creditSecSerieService.buscarStatusSerieCreditSec',
      mensagem: `Erro ao buscar serie: ${req.status} ${req.statusText}`,
      informacaoAdicional: {
        numero_emissao,
        numero_serie,
        url: req.url,
        req,
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
      console.log('error.message');
      console.log(error.message);
      if (error instanceof ErroAplicacao) throw error;

      throw new ErroServidorInterno({
        acao: 'creditSecSerieService.solicitarSerieCreditSec',
        mensagem: 'Erro ao solicitar série no CreditSec',
        erro: error.message,
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

    throw new ErroServidorInterno({
      acao: 'creditSecSerieService.buscarCedenteSigma',
      mensagem: `Erro ao buscar cedente no sigma: ${req.status} ${req.statusText}`,
      informacaoAdicional: {
        identificador,
        url: req.url,
        req,
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
