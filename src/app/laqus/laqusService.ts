import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { StatusRetornoLaqusDto } from './dto/statusRetornoLaqus.dto';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import {
  definirContextosDeTransacao,
  removerContextosDeTransacao,
} from 'src/utils/funcoes/repositorios';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';

export class LaqusService {
  constructor(
    private readonly adaptadorDb: AdaptadorDb,
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly debentureSerieInvestidor: DebentureSerieInvestidorRepositorio,
  ) {}

  async AtualizarInvestidorDebenture({
    status,
    justificativa,
    identificadorInvestidor,
  }: StatusRetornoLaqusDto) {
    this.adaptadorDb.fazerTransacao(async (contexto) => {
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
        throw new NotFoundException('Não foi possível atualizar o status');

      const atualizado =
        await this.debentureSerieInvestidor.atualizarStatusLaqus({
          idFundoInvestimento: fundoInvestimento.id,
          status,
          justificativa,
        });
      if (!atualizado)
        throw new InternalServerErrorException(
          'Não foi possível atualizar o status',
        );
    });

    removerContextosDeTransacao({
      repositorios: [
        this.fundoInvestimentoRepositorio,
        this.debentureSerieInvestidor,
      ],
    });

    return { mensagem: 'atualizado com sucesso!' };
  }
}
