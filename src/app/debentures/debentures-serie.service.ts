import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { debenture_serie } from '@prisma/client';
import { DebentureRepositorio } from 'src/repositorios/contratos/debentureRepositorio';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { AtualizarDebentureSerieDto } from './dto/atualizar-debenture.dto';

@Injectable()
export class DebentureSerieService {
  private readonly limiteDebenture = 50000000;

  constructor(
    private readonly debentureSerieRepositorio: DebentureSerieRepositorio,
    private readonly prismaFundoRepositorio: FundoInvestimentoRepositorio,
    private readonly debentureRespositorio: DebentureRepositorio,
  ) {}

  async criar(
    id_debenture: number,
    id_fundo_investimento: number,
  ): Promise<debenture_serie> {
    const debenture =
      await this.debentureRespositorio.encontrarPorId(id_debenture);

    if (!debenture) {
      throw new NotFoundException(
        `Debenture com ID ${id_debenture} não encontrada`,
      );
    }
    const fundo = await this.prismaFundoRepositorio.encontrarPorId(
      id_fundo_investimento,
    );
    if (!fundo) {
      throw new NotFoundException(
        `Fundo de investimento com ID ${id_fundo_investimento} não encontrado`,
      );
    } else if (!fundo.valor_serie_debenture) {
      throw new BadRequestException(
        'Esse fundo de investimento não possui um valor_serie_debenture',
      );
    }

    const countSeries =
      await this.debentureSerieRepositorio.contarSeries(id_debenture);

    if (countSeries >= 25) {
      throw new BadRequestException(
        'Já foram criadas 25 séries para esta debênture.',
      );
    }

    const seriesExistentes =
      await this.debentureSerieRepositorio.encontrarSeriesPorIdDebenture(
        id_debenture,
      );

    this.verificarLimiteDebenture(
      seriesExistentes,
      Number(fundo.valor_serie_debenture),
    );

    const proximoNumeroSerie =
      seriesExistentes.length === 0
        ? 1
        : seriesExistentes
            .map((serie) => serie.numero_serie)
            .sort((a, b) => a - b)
            .reduce((acc, current) => (acc === current ? acc + 1 : acc), 1);

    const novaSerie = await this.debentureSerieRepositorio.criar({
      numero_serie: proximoNumeroSerie,
      valor_serie: fundo.valor_serie_debenture,
      valor_serie_investido: 0,
      valor_serie_restante: fundo.valor_serie_debenture,
      data_emissao: null,
      data_vencimento: null,
      debenture: {
        connect: { id: id_debenture },
      },
    });

    return novaSerie;
  }

  async encontrarTodos(pagina: number, limite: number) {
    if (pagina <= 0) {
      pagina = 1;
    }
    const deslocamento = (pagina - 1) * limite;
    const [data, total] = await Promise.all([
      this.debentureSerieRepositorio.encontrarTodos(limite, deslocamento),
      this.debentureSerieRepositorio.contarSeriesTotal(),
    ]);

    return {
      data,
      total,
      pagina,
      lastPage: Math.ceil(total / limite),
    };
  }

  async encontrarPorId(id: number): Promise<debenture_serie | null> {
    const debenture = await this.debentureSerieRepositorio.encontrarPorId(id);
    if (!debenture) {
      throw new NotFoundException(`Debenture Serie with ID ${id} not found`);
    }
    return debenture;
  }

  async atualizar(
    id: number,
    data: AtualizarDebentureSerieDto,
  ): Promise<debenture_serie | null> {
    if (data.valor_serie) {
      const debentureSerie = await this.encontrarPorId(id);
      const seriesExistentes =
        await this.debentureSerieRepositorio.encontrarSeriesPorIdDebenture(
          debentureSerie.id_debenture,
        );

      this.verificarLimiteDebenture(
        seriesExistentes,
        data.valor_serie - Number(debentureSerie.valor_serie),
      );
    }
    return this.debentureSerieRepositorio.atualizar(id, data);
  }

  async deletar(id: number): Promise<void> {
    await this.debentureSerieRepositorio.deletar(id);
  }

  private verificarLimiteDebenture(
    arrayDeSeries: debenture_serie[],
    valor_serie: number,
  ) {
    const valorTotalSeriesExistentes = arrayDeSeries.reduce(
      (acc, serie) => acc + Number(serie.valor_serie),
      0,
    );

    if (valorTotalSeriesExistentes + valor_serie > this.limiteDebenture) {
      throw new BadRequestException(
        'Não é possível criar uma nova série: o limite da debênture foi atingido (R$ 50 milhões).',
      );
    }
  }
}
