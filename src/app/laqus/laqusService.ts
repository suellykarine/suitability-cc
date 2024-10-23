import {
  NotFoundException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { StatusRetornoLaqusDto } from './dto/statusRetornoLaqus.dto';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import {
  definirContextosDeTransacao,
  removerContextosDeTransacao,
} from 'src/utils/funcoes/repositorios';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';

@Injectable()
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
