import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { CriarInvestidorLaqusDto } from './dto/criarInvestidorLaqus.dto';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import { AtualizarDebentureSerieInvestidorLaqus } from 'src/@types/entities/debenture';
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
} from '@nestjs/common';

@Injectable()
export class LaqusService {
  laqusApi: string;
  token: string;
  constructor(
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly configService: ConfigService,
    private readonly adaptadorDb: AdaptadorDb,
  ) {
    this.token = this.configService.get<string>('LAQUS_TOKEN_API');
    this.laqusApi = this.configService.get<string>('LAQUS_API');
  }

  async AtualizarInvestidorDebenture({
    identificadorInvestidor,
    justificativa,
    status,
  }: StatusRetornoLaqusDto) {
    try {
      await this.adaptadorDb.fazerTransacao(async (contexto) => {
        definirContextosDeTransacao({
          repositorios: [
            this.debentureSerieInvestidorRepositorio,
            this.fundoInvestimentoRepositorio,
          ],
          contexto,
        });

        const fundoInvestimento =
          await this.fundoInvestimentoRepositorio.encontrarPorCpfCnpj(
            identificadorInvestidor,
          );

        if (!fundoInvestimento)
          throw new NotFoundException(
            'Fundo de investimento não foi encontrado',
          );

        const payload = this.montarPayloadAtualizarDebentureSerieInvestidor({
          idFundoInvestimento: fundoInvestimento.id,
          mensagemRetornoLaqus: justificativa,
          statusRetornoLaqus: status,
          dataDesvinculo: status === 'Reprovado' ? new Date() : undefined,
        });

        if (status === 'Reprovado') {
          await this.desabilitarDebentureDoFundoDeInvestimento(
            fundoInvestimento.id,
          );
        }

        const atualizados =
          await this.debentureSerieInvestidorRepositorio.atualizarStatusLaqus(
            payload,
          );

        if (!atualizados.count)
          throw new BadRequestException(
            'Não foi encontrado nenhuma debenture serie investidor com status Pendente para esse investidor',
          );
      });

      if (status === 'Aprovado') {
        // TO-DO: Chamar cred-sec
      }

      removerContextosDeTransacao({
        repositorios: [
          this.fundoInvestimentoRepositorio,
          this.debentureSerieInvestidorRepositorio,
        ],
      });
      return { mensagem: 'atualizado com sucesso!' };
    } catch (error) {
      removerContextosDeTransacao({
        repositorios: [
          this.fundoInvestimentoRepositorio,
          this.debentureSerieInvestidorRepositorio,
        ],
      });
      throw error;
    }
  }

  async cadastrarInvestidor(data: CriarInvestidorLaqusDto) {
    const response = await fetch(`${this.laqusApi}/cadastro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new HttpException(
        'Não foi possível cadastrar o investidor',
        response.status,
      );
    }

    return result;
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
