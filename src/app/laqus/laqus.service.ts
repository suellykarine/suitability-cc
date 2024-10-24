import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CriarInvestidorLaqusDto } from './dto/criarInvestidorLaqus.dto';
import { ConfigService } from '@nestjs/config';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { StatusRetornoLaqusDto } from './dto/statusRetornoLaqus.dto';
import {
  definirContextosDeTransacao,
  removerContextosDeTransacao,
} from 'src/utils/funcoes/repositorios';

@Injectable()
export class LaqusService {
  token: string;
  laqusApi: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly adaptadorDb: AdaptadorDb,
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly debentureSerieInvestidor: DebentureSerieInvestidorRepositorio,
  ) {
    this.laqusApi = this.configService.get<string>('LAQUS_API');
    this.token = this.configService.get<string>('LAQUS_TOKEN_API');
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

  async AtualizarInvestidorDebenture({
    status,
    justificativa,
    identificadorInvestidor,
  }: StatusRetornoLaqusDto) {
    try {
      await this.adaptadorDb.fazerTransacao(async (contexto) => {
        definirContextosDeTransacao({
          repositorios: [
            this.fundoInvestimentoRepositorio,
            this.debentureSerieInvestidor,
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
        const atualizado =
          await this.debentureSerieInvestidor.atualizarStatusLaqus({
            idFundoInvestimento: fundoInvestimento.id,
            status,
            justificativa,
          });

        if (atualizado.count == 0)
          throw new BadRequestException(
            'Não foi encontrado nenhuma debenture serie investidor com status Pendente para esse investidor',
          );
      });

      removerContextosDeTransacao({
        repositorios: [
          this.fundoInvestimentoRepositorio,
          this.debentureSerieInvestidor,
        ],
      });
      return { mensagem: 'atualizado com sucesso!' };
    } catch (error) {
      removerContextosDeTransacao({
        repositorios: [
          this.fundoInvestimentoRepositorio,
          this.debentureSerieInvestidor,
        ],
      });
      throw error;
    }
  }
}
