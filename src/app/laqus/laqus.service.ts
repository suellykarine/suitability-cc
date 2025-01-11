import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { CreditSecSerieService } from '../credit-sec/modules/credit-sec-serie/credit-sec-serie.service';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { CadastroCedenteService } from '../cedente/cedenteCadastro.service';
import { StatusRetornoLaqusDto } from './dto/statusRetornoLaqus.dto';
import { tratarErroRequisicao } from 'src/utils/funcoes/erros';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import { LogService } from '../global/logs/log.service';
import { CadastrarLaqusPayload } from './types';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import {
  AtualizarDebentureSerieInvestidorLaqus,
  StatusRetornoLaqus,
} from 'src/@types/entities/debenture';
import {
  Funcao,
  TipoDeEmpresa,
  TipoPessoa,
} from './dto/criarInvestidorLaqus.dto';
import {
  ErroNaoEncontrado,
  ErroRequisicaoInvalida,
  ErroServidorInterno,
} from 'src/helpers/erroAplicacao';

@Injectable()
export class LaqusService {
  laqusApi: string;
  token: string;
  constructor(
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly cadastroCedenteService: CadastroCedenteService,
    private readonly creditSecSerieService: CreditSecSerieService,
    private readonly configService: ConfigService,
    private readonly adaptadorDb: AdaptadorDb,
    private readonly logService: LogService,
  ) {
    this.token = this.configService.get<string>('LAQUS_TOKEN_API');
    this.laqusApi = this.configService.get<string>('LAQUS_API');
  }

  async AtualizarInvestidorDebenture({
    identificadorInvestidor,
    justificativa,
    status,
  }: StatusRetornoLaqusDto) {
    const logAcao = 'laqusService.atualizarInvestidorDebenture';
    const fundoInvestimento =
      await this.fundoInvestimentoRepositorio.encontrarPorCpfCnpj(
        identificadorInvestidor,
      );

    if (!fundoInvestimento)
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem: 'Fundo de investimento não foi encontrado',
        detalhes: {
          identificadorInvestidor,
          justificativa,
          status,
        },
      });

    const ultimoVinculoDSI =
      await this.debentureSerieInvestidorRepositorio.encontrarMaisRecentePorIdFundoInvestimento(
        { id_fundo_investimento: fundoInvestimento.id },
      );

    if (!ultimoVinculoDSI)
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem:
          'Não foi encontrado nenhuma debenture serie investidor para esse investidor',
        detalhes: {
          identificadorInvestidor,
          justificativa,
          status,
        },
      });
    const debentureSerieInvestidorAtualizado =
      await this.adaptadorDb.fazerTransacao(async () => {
        if (status === 'Reprovado') {
          await this.logService.aviso({
            acao: 'laqus.AtualizarInvestidorDebenture',
            mensagem: 'Investidor reprovado no Laqus',
            detalhes: {
              fundoInvestimento,
              identificadorInvestidor,
              justificativa,
              status,
            },
          });
          await this.desabilitarDebentureDoFundoDeInvestimento(
            fundoInvestimento.id,
          );
        }

        const debentureSerieInvestidorAtualizado =
          await this.debentureSerieInvestidorRepositorio.atualizar({
            id: ultimoVinculoDSI.id,
            mensagem_retorno_laqus: justificativa,
            status_retorno_laqus: status.toUpperCase() as StatusRetornoLaqus,
            data_desvinculo: status === 'Reprovado' ? new Date() : null,
          });
        if (!debentureSerieInvestidorAtualizado)
          throw new ErroRequisicaoInvalida({
            acao: logAcao,
            mensagem:
              'Não foi encontrado nenhuma debenture serie investidor com status Pendente para esse investidor',
            detalhes: {
              identificadorInvestidor,
              justificativa,
              status,
            },
          });
        return debentureSerieInvestidorAtualizado;
      }, [
        this.fundoInvestimentoRepositorio,
        this.debentureSerieInvestidorRepositorio,
      ]);

    if (status === 'Aprovado') {
      await this.creditSecSerieService.solicitarSerie(
        debentureSerieInvestidorAtualizado.id,
      );
    }

    return { mensagem: 'atualizado com sucesso!' };
  }

  async cadastrarInvestidor(identificadorDSI: number) {
    const debentureSerieInvestidor =
      await this.debentureSerieInvestidorRepositorio.encontrarPorId(
        identificadorDSI,
      );

    if (!debentureSerieInvestidor) {
      throw new ErroNaoEncontrado({
        acao: 'laqus.cadastrarInvestidor',
        mensagem: 'Debenture Serie Investidor não encontrado',
        detalhes: {
          dsi: identificadorDSI,
        },
      });
    }

    const { fundo_investimento: fundo, conta_investidor: contaInvestidor } =
      debentureSerieInvestidor;
    const { endereco, ramoAtividade } =
      await this.cadastroCedenteService.buscarDadosPJ(fundo.cpf_cnpj);

    const atividadePrincipal =
      fundo.atividade_principal || ramoAtividade?.descricao || '';
    const dadosCedente = {
      tipoDeEmpresa: TipoDeEmpresa.Limitada,
      tipoPessoa: TipoPessoa.Juridica,
      funcao: Funcao.Investidor,
      email:
        fundo.fundo_investimento_gestor_fundo?.[0]
          .usuario_fundo_investimento?.[0].usuario?.email ?? '',
      cnpj: fundo.cpf_cnpj ?? '',
      razaoSocial: fundo.razao_social ?? '',
      atividadePrincipal,
      faturamentoMedioMensal12Meses: Number(fundo.faturamento_anual),
      endereco: {
        cep: endereco?.cep ?? '',
        rua: endereco?.logradouro ?? '',
        numero: endereco?.numero ?? '',
        complemento: endereco?.complemento ?? '',
        bairro: endereco?.bairro ?? '',
        cidade: endereco?.cidade ?? '',
        uf: endereco?.uf ?? '',
      },
      dadosBancarios: {
        codigoDoBanco: contaInvestidor?.codigo_banco ?? '',
        agencia: contaInvestidor?.agencia ?? '',
        digitoDaAgencia: contaInvestidor?.agencia_digito ?? '',
        contaCorrente: contaInvestidor?.conta ?? '',
        digitoDaConta: contaInvestidor?.conta_digito ?? '',
      },
      telefones: [
        {
          numero: fundo.administrador_fundo?.telefone.slice(-11) ?? '',
          tipo: 'Celular',
        },
      ],
    };
    const callbackUrl = `${this.configService.get<string>('BASE_URL')}api/laqus/atualizarStatus`;
    const payload: CadastrarLaqusPayload = {
      callbackUrl,
      dadosCedente,
    };

    const response = await fetch(`${this.laqusApi}/cadastro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(payload),
    });
    const retornoLaqus = (await response.json()) as { id: string };

    if (!response.ok) {
      throw new ErroServidorInterno({
        acao: 'laqus.cadastrarInvestidor',
        mensagem: 'Erro ao cadastrar investidor no Laqus',
        detalhes: { payload, retornoLaqus, response },
      });
    }

    if (!retornoLaqus.id) {
      throw new ErroServidorInterno({
        acao: 'laqus.cadastrarInvestidor',
        mensagem: 'O identificador Laqus não foi retornado',
        detalhes: { retornoLaqus, response: response, payload },
      });
    }

    const atualizadoComIdentificadorLaqus =
      await this.debentureSerieInvestidorRepositorio.atualizar({
        id: identificadorDSI,
        status_retorno_laqus: 'PENDENTE',
        mensagem_retorno_laqus: null,
        codigo_investidor_laqus: retornoLaqus.id,
      });

    if (!atualizadoComIdentificadorLaqus) {
      throw new ErroServidorInterno({
        acao: 'laqus.cadastrarInvestidor',
        mensagem:
          'Não foi possível atualizar o debenture serie investidor com o identificador Laqus',
        detalhes: {
          debentureSerieInvestidor,
          retornoLaqus,
          payload,
        },
      });
    }
    this.logService.info({
      acao: 'laqus.cadastrarInvestidor',
      mensagem: 'Investidor cadastrado com sucesso no Laqus',
      detalhes: {
        payload,
        retornoLaqus,
        atualizadoComIdentificadorLaqus,
      },
    });

    return retornoLaqus;
  }

  async buscarStatusInvestidor(id: string) {
    const req = await fetch(`${this.laqusApi}/buscar-status-investidor/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!req.ok) {
      await tratarErroRequisicao({
        acao: 'LaqusService.buscarStatusInvestidor',
        mensagem: 'Não foi possível buscar o status do investidor',
        req,
        detalhes: {
          id,
          status: req.status,
          texto: req.statusText,
          url: req.url,
        },
      });
    }

    const result = await req.json();
    return result;
  }

  private montarPayloadAtualizarDebentureSerieInvestidor(
    payload: AtualizarDebentureSerieInvestidorLaqus,
  ): AtualizarDebentureSerieInvestidorLaqus {
    const { dataDesvinculo, ...payloadSemDataDesvinculo } = payload;
    return dataDesvinculo ? payload : payloadSemDataDesvinculo;
  }

  private async desabilitarDebentureDoFundoDeInvestimento(idFundo: number) {
    const desabilitarDebenture =
      await this.fundoInvestimentoRepositorio.atualizaAptoDebentureEvalorSerie({
        apto_debenture: false,
        id_fundo: idFundo,
        valor_serie_debenture: null,
      });
    return desabilitarDebenture;
  }
}
