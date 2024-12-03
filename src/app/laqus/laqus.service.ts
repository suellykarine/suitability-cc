import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import {
  AtualizarDebentureSerieInvestidorLaqus,
  StatusRetornoLaqus,
} from 'src/@types/entities/debenture';
import { StatusRetornoLaqusDto } from './dto/statusRetornoLaqus.dto';
import { ConfigService } from '@nestjs/config';
import {
  definirContextosDeTransacao,
  removerContextosDeTransacao,
} from 'src/utils/funcoes/repositorios';
import {
  BadRequestException,
  NotFoundException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CadastrarLaqusPayload } from './types';
import { CreditSecSerieService } from '../credit-sec/credit-sec-serie.service';
import { CadastroCedenteService } from '../cedente/cedenteCadastro.service';
import {
  Funcao,
  TipoDeEmpresa,
  TipoPessoa,
} from './dto/criarInvestidorLaqus.dto';

@Injectable()
export class LaqusService {
  laqusApi: string;
  token: string;
  constructor(
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly configService: ConfigService,
    private readonly creditSecSerieService: CreditSecSerieService,
    private readonly adaptadorDb: AdaptadorDb,
    private readonly cadastroCedenteService: CadastroCedenteService,
  ) {
    this.token = this.configService.get<string>('LAQUS_TOKEN_API');
    this.laqusApi = this.configService.get<string>('LAQUS_API');
  }

  async AtualizarInvestidorDebenture({
    identificadorInvestidor,
    justificativa,
    status,
  }: StatusRetornoLaqusDto) {
    const fundoInvestimento =
      await this.fundoInvestimentoRepositorio.encontrarPorCpfCnpj(
        identificadorInvestidor,
      );

    if (!fundoInvestimento)
      throw new NotFoundException('Fundo de investimento não foi encontrado');

    const ultimoVinculoDSI =
      await this.debentureSerieInvestidorRepositorio.encontrarMaisRecentePorIdFundoInvestimento(
        { id_fundo_investimento: fundoInvestimento.id },
      );

    if (!ultimoVinculoDSI)
      throw new NotFoundException(
        'Não foi encontrado nenhuma debenture serie investidor para esse investidor',
      );
    const debentureSerieInvestidorAtualizado =
      await this.adaptadorDb.fazerTransacao(async (contexto) => {
        try {
          definirContextosDeTransacao({
            repositorios: [
              this.debentureSerieInvestidorRepositorio,
              this.fundoInvestimentoRepositorio,
            ],
            contexto,
          });
          if (status === 'Reprovado') {
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
            throw new BadRequestException(
              'Não foi encontrado nenhuma debenture serie investidor com status Pendente para esse investidor',
            );
          removerContextosDeTransacao({
            repositorios: [
              this.fundoInvestimentoRepositorio,
              this.debentureSerieInvestidorRepositorio,
            ],
          });

          return debentureSerieInvestidorAtualizado;
        } catch (error) {
          removerContextosDeTransacao({
            repositorios: [
              this.fundoInvestimentoRepositorio,
              this.debentureSerieInvestidorRepositorio,
            ],
          });
          throw error;
        }
      });

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
      throw new NotFoundException('Debenture Serie Investidor não encontrado');
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
    const callbackUrl = `${this.configService.get<string>('BASE_URL')}/laqus/atualizarStatus`;
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
      console.log(retornoLaqus);
      throw new HttpException(
        'Não foi possível cadastrar o investidor na laqus',
        response.status,
      );
    }

    if (!retornoLaqus.id) {
      throw new InternalServerErrorException(
        'O identificador Laqus não foi retornado',
      );
    }

    const atualizadoComIdentificadorLaqus =
      await this.debentureSerieInvestidorRepositorio.atualizar({
        id: identificadorDSI,
        status_retorno_laqus: 'PENDENTE',
        mensagem_retorno_laqus: null,
        codigo_investidor_laqus: retornoLaqus.id,
      });

    if (!atualizadoComIdentificadorLaqus) {
      throw new InternalServerErrorException(
        'Não foi possível atualizar o status do retorno Laqus',
      );
    }

    return retornoLaqus;
  }

  async buscarStatusInvestidor(id: string) {
    const response = await fetch(
      `${this.laqusApi}/buscar-status-investidor/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    if (!response.ok) {
      throw new HttpException(
        'Não foi possível buscar o status do investidor',
        response.status,
      );
    }

    const result = await response.json();
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
