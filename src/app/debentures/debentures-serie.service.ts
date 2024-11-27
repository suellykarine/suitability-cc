import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DebentureRepositorio } from 'src/repositorios/contratos/debentureRepositorio';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { AtualizarDebentureSerieDto } from './dto/atualizar-debenture-serie.dto';
import {
  AtualizarValorSerie,
  DebentureSerie,
  DebentureSerieInvestidor,
} from 'src/@types/entities/debenture';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { ContaInvestidorRepositorio } from 'src/repositorios/contratos/contaInvestidorRespositorio';
import { LaqusService } from '../laqus/laqus.service';
import {
  Funcao,
  TipoDeEmpresa,
  TipoPessoa,
} from '../laqus/dto/criarInvestidorLaqus.dto';
import { FundoInvestimento } from 'src/@types/entities/fundos';
import { SrmBankService } from '../srm-bank/srm-bank.service';
import { ConfigService } from '@nestjs/config';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import {
  definirContextosDeTransacao,
  removerContextosDeTransacao,
} from 'src/utils/funcoes/repositorios';
import { CriarDebentureSerieDto } from './dto/criar-debenure-serie.dto';
import {
  calcularDataDeCorte,
  ehValidaPorData,
  encontrarSerieComValorAproximado,
  filtrarSeriesPorValor,
  pertenceADebentureAtual,
} from './utils/estaAptoAEstruturar';
import { CadastroCedenteService } from '../cedente/cedenteCadastro.service';

type FiltrarSeriesValidasProps = {
  seriesId: number[];
  debentureId: number;
  dataDeCorte: Date;
};
@Injectable()
export class DebentureSerieService {
  private readonly limiteDebenture = 50000000;

  constructor(
    private readonly debentureSerieRepositorio: DebentureSerieRepositorio,
    private readonly prismaFundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly debentureRepositorio: DebentureRepositorio,
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
    private readonly contaInvestidorRepositorio: ContaInvestidorRepositorio,
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly laqusService: LaqusService,
    private readonly srmBankService: SrmBankService,
    private readonly configService: ConfigService,
    private readonly adaptadorDb: AdaptadorDb,
    private readonly cadastroCedenteService: CadastroCedenteService,
  ) {}

  async solicitarSerie({
    valorEntrada,
    identificadorFundo,
  }: CriarDebentureSerieDto): Promise<DebentureSerie | undefined> {
    return this.adaptadorDb.fazerTransacao(async (contexto) => {
      definirContextosDeTransacao({
        repositorios: [
          this.debentureSerieRepositorio,
          this.debentureSerieInvestidorRepositorio,
          this.contaInvestidorRepositorio,
        ],
        contexto,
      });
      const debenture = await this.debentureRepositorio.buscarAtiva();

      if (!debenture) {
        throw new NotFoundException('Debenture ativa não encontrada');
      }

      const idDebenture = debenture.id;

      const fundo =
        await this.prismaFundoInvestimentoRepositorio.encontrarPorId(
          identificadorFundo,
        );

      if (!fundo) {
        throw new NotFoundException(
          `Fundo de investimento com ID ${identificadorFundo} não encontrado`,
        );
      }

      if (!valorEntrada) {
        throw new BadRequestException(
          'Valor série não enviado ou fundo não possuí um valor de serie',
        );
      }

      const debentureSerieInvestidorDesvinculado =
        await this.debentureSerieInvestidorRepositorio.encontrarPorDesvinculo({
          idDebenture,
        });
      const debentureSerieDesvinculada =
        debentureSerieInvestidorDesvinculado?.debenture_serie;
      const debentureSerieDesvinculadaValida =
        debentureSerieDesvinculada &&
        debentureSerieDesvinculada?.data_vencimento &&
        debentureSerieDesvinculada?.data_vencimento > new Date();
      const seriesParaVerificarLimite = debenture.debenture_serie.filter(
        (serie) => serie.id !== debentureSerieDesvinculada?.id,
      );

      this.verificarLimiteDebenture(seriesParaVerificarLimite, valorEntrada);

      const debentureSerieInvestidorEncontradosPeloFundo =
        await this.debentureSerieInvestidorRepositorio.encontrarPorIdFundoInvestimento(
          { id_fundo_investimento: identificadorFundo },
        );

      const DebentureSerieInvestidorPeloFundoOrdenados =
        debentureSerieInvestidorEncontradosPeloFundo?.sort((a, b) => {
          if (!a.data_vinculo || !b.data_vinculo) return 0;
          if (a.data_vinculo > b.data_vinculo) return -1;
          if (a.data_vinculo < b.data_vinculo) return 1;
          return 0;
        });

      const ultimoVinculoFundo =
        DebentureSerieInvestidorPeloFundoOrdenados?.[0];

      const { status_retorno_laqus, codigo_investidor_laqus } =
        ultimoVinculoFundo ?? {};

      const fundoReprovadoLaqus =
        status_retorno_laqus?.toLocaleLowerCase() === 'reprovado';
      if (fundoReprovadoLaqus)
        throw new BadRequestException('O investidor está reprovado pela Laqus');

      const fundoPendenteLaqus =
        status_retorno_laqus?.toLocaleLowerCase() === 'pendente';

      if (fundoPendenteLaqus) {
        throw new BadRequestException(
          'O investidor está com cadastro pendente na Laqus',
        );
      }
      const fundoNovoLaqus = !status_retorno_laqus;

      if (debentureSerieDesvinculadaValida) {
        const valorSerieDesvinculada = Number(
          debentureSerieInvestidorDesvinculado?.debenture_serie?.valor_serie,
        );
        const serieEncontradaIgualValorAtual =
          valorEntrada === valorSerieDesvinculada;

        if (!serieEncontradaIgualValorAtual) {
          this.atualizarValorDaSerie({
            idDebentureSerie:
              debentureSerieInvestidorDesvinculado.id_debenture_serie,
            valorSerie: valorEntrada,
          });
        }

        await this.reutilizarTabelaContaInvestidorECriarDebentureSerieInvestidor(
          {
            idDebentureSerie:
              debentureSerieInvestidorDesvinculado.id_debenture_serie,
            idContaInvestidor:
              debentureSerieInvestidorDesvinculado.id_conta_investidor,
            idFundoInvestimento: identificadorFundo,
            idLaqus: codigo_investidor_laqus,
            statusLaqus: status_retorno_laqus,
          },
        );

        if (fundoNovoLaqus) {
          await this.chamarLaqus(fundo, debentureSerieInvestidorDesvinculado);
        }
        removerContextosDeTransacao({
          repositorios: [
            this.debentureSerieRepositorio,
            this.debentureSerieInvestidorRepositorio,
            this.contaInvestidorRepositorio,
          ],
        });
        return debentureSerieInvestidorDesvinculado.debenture_serie;
      }

      const debentureSerieInvestidorEncerrado =
        await this.debentureSerieInvestidorRepositorio.encontrarPorEncerramento();

      const novaSerie = await this.criarNovaSerie({
        idDebenture: idDebenture,
        valorSerie: valorEntrada,
      });
      if (debentureSerieInvestidorEncerrado) {
        const idContaInvestidor =
          debentureSerieInvestidorEncerrado.id_conta_investidor;
        await this.reutilizarTabelaContaInvestidorECriarDebentureSerieInvestidor(
          {
            idDebentureSerie: novaSerie.id,
            idContaInvestidor,
            idFundoInvestimento: identificadorFundo,
            idLaqus: codigo_investidor_laqus,
            statusLaqus: status_retorno_laqus,
          },
        );

        if (fundoNovoLaqus) {
          await this.chamarLaqus(fundo, debentureSerieInvestidorEncerrado);
        }
        removerContextosDeTransacao({
          repositorios: [
            this.debentureSerieRepositorio,
            this.debentureSerieInvestidorRepositorio,
            this.contaInvestidorRepositorio,
          ],
        });
        return novaSerie;
      }

      const identificador = this.configService.get('IDENTIFICADOR_CEDENTE');
      const novaContaInvestidor =
        await this.srmBankService.criarContaInvestidor({
          identificador: identificador,
          id_cedente: String(fundo.id),
        });

      const novaDebentureSerieInvestidor =
        await this.criarDebentureSerieInvestidor({
          idContaInvestidor: novaContaInvestidor.conta_investidor?.id,
          idDebentureSerie: novaSerie.id,
          idFundoInvestimento: fundo.id,
        });

      if (fundoNovoLaqus) {
        await this.chamarLaqus(fundo, novaDebentureSerieInvestidor);
      }

      removerContextosDeTransacao({
        repositorios: [
          this.debentureSerieRepositorio,
          this.debentureSerieInvestidorRepositorio,
          this.contaInvestidorRepositorio,
        ],
      });
      return novaSerie;
    });
  }

  private async reutilizarTabelaContaInvestidorECriarDebentureSerieInvestidor({
    idContaInvestidor,
    idDebentureSerie,
    idFundoInvestimento,
    idLaqus,
    statusLaqus,
  }: {
    idDebentureSerie: number;
    idContaInvestidor: number;
    idFundoInvestimento: number;
    statusLaqus?: string;
    idLaqus?: string;
  }): Promise<void> {
    await this.contaInvestidorRepositorio.atualizarContaInvestidorFundoInvestimento(
      idFundoInvestimento,
      idContaInvestidor,
    );
    await this.criarDebentureSerieInvestidor({
      idDebentureSerie,
      idContaInvestidor,
      idFundoInvestimento,
      statusLaqus,
      idLaqus,
    });
  }

  private async criarDebentureSerieInvestidor({
    idContaInvestidor,
    idDebentureSerie,
    idFundoInvestimento,
    idLaqus,
    statusLaqus,
  }: {
    idDebentureSerie: number;
    idContaInvestidor?: number;
    idFundoInvestimento: number;
    statusLaqus?: string;
    idLaqus?: string;
  }) {
    return await this.debentureSerieInvestidorRepositorio.criar({
      id_debenture_serie: idDebentureSerie,
      id_conta_investidor: idContaInvestidor,
      id_fundo_investimento: idFundoInvestimento,
      data_vinculo: new Date(),
      codigo_investidor_laqus: idLaqus,
      status_retorno_laqus: statusLaqus ?? 'Pendente',
    });
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

  private async criarNovaSerie({
    idDebenture,
    valorSerie,
  }: {
    idDebenture: number;
    valorSerie: number;
  }) {
    const seriesExistentes =
      await this.debentureSerieRepositorio.encontrarSeriesPorIdDebenture(
        idDebenture,
      );
    const seriesExistentesQtd = seriesExistentes.length;

    if (seriesExistentesQtd >= 25) {
      throw new BadRequestException(
        'Já foram criadas 25 séries para esta debênture.',
      );
    }

    const proximoNumeroSerie =
      this.calcularProximoNumeroSerie(seriesExistentes);

    const novaSerie = await this.debentureSerieRepositorio.criar({
      numero_serie: proximoNumeroSerie,
      id_debenture: idDebenture,
      valor_serie: valorSerie,
      valor_serie_investido: 0,
    });

    return novaSerie;
  }

  async encontrarPorId(id: number): Promise<DebentureSerie | null> {
    const debenture = await this.debentureSerieRepositorio.encontrarPorId(id);
    if (!debenture) {
      throw new NotFoundException(`Debenture Serie with ID ${id} not found`);
    }
    return debenture;
  }

  async atualizar(
    id: number,
    data: AtualizarDebentureSerieDto,
  ): Promise<DebentureSerie | null> {
    if (data.valor_serie) {
      const debentureSerie = await this.encontrarPorId(id);
      if (!debentureSerie)
        throw new BadRequestException(
          'Não foi possível encontrar a debenture serie',
        );
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

  async atualizarValorDaSerie({
    idDebentureSerie,
    valorSerie,
  }: AtualizarValorSerie): Promise<DebentureSerie | null> {
    const debentureSerie = await this.encontrarPorId(idDebentureSerie);

    if (!debentureSerie)
      throw new NotFoundException('Debenture série não encontrada');

    if (
      debentureSerie.data_vencimento &&
      debentureSerie.data_vencimento < new Date()
    )
      throw new BadRequestException('Debenture serie expirada');

    const data = { valor_serie: valorSerie };
    const atualizado = await this.atualizar(idDebentureSerie, data);
    if (!atualizado)
      throw new InternalServerErrorException(
        'Não foi possível atualizar a debenture série',
      );
    return atualizado;
  }

  async deletar(id: number): Promise<void> {
    await this.debentureSerieRepositorio.deletar(id);
  }
  async estaAptoAEstruturar(
    idInvestidor: number,
    valorEntrada: number,
  ): Promise<{
    mensagem: string;
    data: DebentureSerie;
  } | null> {
    return this.adaptadorDb.fazerTransacao(async (contexto) => {
      definirContextosDeTransacao({
        repositorios: [
          this.debentureSerieRepositorio,
          this.debentureSerieInvestidorRepositorio,
          this.contaInvestidorRepositorio,
          this.fundoInvestimentoRepositorio,
        ],
        contexto,
      });
      const estaApto =
        await this.fundoInvestimentoRepositorio.buscarEstaAptoADebentureRepositorio(
          idInvestidor,
        );

      if (!estaApto) {
        throw new BadRequestException(
          'O investidor não está apto a investir por debenture',
        );
      }

      const seriesValidasDoInvestidor =
        await this.debentureSerieInvestidorRepositorio.buscarTodasDebentureSerieValidas(
          idInvestidor,
        );

      if (seriesValidasDoInvestidor.length === 0) {
        throw new BadRequestException('Não foram encontradas séries válidas');
      }

      const debentureAtual = await this.debentureRepositorio.buscarAtiva();

      const dataDeCorte = calcularDataDeCorte(6);

      const seriesValidasEComSaldoNaDebentureAtual =
        await this.filtrarSeriesValidas({
          seriesId: seriesValidasDoInvestidor,
          debentureId: debentureAtual.id,
          dataDeCorte,
        });

      if (seriesValidasEComSaldoNaDebentureAtual.length === 0) {
        throw new BadRequestException(
          'Não foram encontradas séries válidas  e com saldo na debenture atual',
        );
      }

      const seriesComSaldoSuficiente = filtrarSeriesPorValor({
        series: seriesValidasEComSaldoNaDebentureAtual,
        valorEntrada,
      });

      if (seriesComSaldoSuficiente.length > 0) {
        const serieMaisApropriada = encontrarSerieComValorAproximado({
          series: seriesComSaldoSuficiente,
          valorEntrada,
        });
        removerContextosDeTransacao({
          repositorios: [
            this.debentureSerieRepositorio,
            this.debentureSerieInvestidorRepositorio,
            this.contaInvestidorRepositorio,
          ],
        });
        return {
          mensagem: 'Debenture com saldo encontrada',
          data: serieMaisApropriada,
        };
      }
      const fundoInvestimento =
        await this.fundoInvestimentoRepositorio.encontrarPorId(idInvestidor);
      if (!fundoInvestimento) {
        throw new NotFoundException('fundo de investimento não encontrado');
      }

      if (!fundoInvestimento.valor_serie_debenture)
        throw new InternalServerErrorException(
          'o valor da debenture serie não foi encontrado',
        );

      const saldoNovaDebentureSerie =
        valorEntrada > fundoInvestimento.valor_serie_debenture
          ? valorEntrada
          : fundoInvestimento.valor_serie_debenture;
      const novaSerie = await this.solicitarSerie({
        valorEntrada: saldoNovaDebentureSerie,
        identificadorFundo: idInvestidor,
      });
      if (!novaSerie) {
        throw new InternalServerErrorException(
          'Não foi possível criar uma nova serie',
        );
      }
      removerContextosDeTransacao({
        repositorios: [
          this.debentureSerieRepositorio,
          this.debentureSerieInvestidorRepositorio,
          this.contaInvestidorRepositorio,
        ],
      });
      return {
        mensagem: 'Debenture com saldo encontrada',
        data: novaSerie,
      };
    });
  }

  private async filtrarSeriesValidas({
    seriesId,
    debentureId,
    dataDeCorte,
  }: FiltrarSeriesValidasProps): Promise<DebentureSerie[]> {
    const seriesValidas = await Promise.all(
      seriesId.map(async (serieId) => {
        const serie =
          await this.debentureSerieRepositorio.encontrarPorId(serieId);
        const atendeCriteriosBasicos =
          pertenceADebentureAtual({ serie, debentureId }) &&
          ehValidaPorData({ serie, dataDeCorte });
        return atendeCriteriosBasicos ? serie : null;
      }),
    );
    return seriesValidas.filter((serie) => serie !== null);
  }

  private verificarLimiteDebenture(
    arrayDeSeries: DebentureSerie[] = [],
    valorEntrada: number,
  ) {
    const valorTotalSeriesExistentes = arrayDeSeries.reduce(
      (acc, serie) => acc + Number(serie.valor_serie),
      0,
    );

    if (valorTotalSeriesExistentes + valorEntrada > this.limiteDebenture) {
      throw new BadRequestException(
        'Não é possível criar uma nova série: o limite da debênture foi atingido (R$ 50 milhões).',
      );
    }
  }

  private calcularProximoNumeroSerie(seriesExistentes: DebentureSerie[]) {
    const semSeriesExistentes = !seriesExistentes.length;

    if (semSeriesExistentes) return 1;

    const numerosSerie = seriesExistentes
      .map((serie) => serie.numero_serie)
      .sort((a, b) => a - b);

    return numerosSerie.reduce((acc, current) => {
      return acc === current ? acc + 1 : acc;
    }, 1);
  }

  private async chamarLaqus(
    fundo: FundoInvestimento,
    serie: DebentureSerieInvestidor,
  ): Promise<{ identificadorLaqus: string }> {
    if (!fundo) throw new InternalServerErrorException('azedou');
    const { endereco } = await this.cadastroCedenteService.buscarDadosPJ(
      fundo.cpf_cnpj,
    );
    const retornoLaqus = await this.laqusService.cadastrarInvestidor({
      tipoDeEmpresa: TipoDeEmpresa.Limitada,
      tipoPessoa: TipoPessoa.Juridica,
      funcao: Funcao.Investidor,
      email:
        fundo.fundo_investimento_gestor_fundo?.[0]
          .usuario_fundo_investimento?.[0].usuario?.email ?? '',
      cnpj: fundo.cpf_cnpj ?? '',
      razaoSocial: fundo.razao_social ?? '',
      atividadePrincipal: fundo.atividade_principal ?? '',
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
        codigoDoBanco: serie.conta_investidor?.codigo_banco ?? '',
        agencia: serie.conta_investidor?.agencia ?? '',
        digitoDaAgencia: serie.conta_investidor?.agencia_digito ?? '',
        contaCorrente: serie.conta_investidor?.conta ?? '',
        digitoDaConta: serie.conta_investidor?.conta_digito ?? '',
      },
      telefones: [
        {
          numero: fundo.administrador_fundo?.telefone ?? '',
          tipo: 'Celular',
        },
      ],
    });
    if (!retornoLaqus.identificadorLaqus) {
      throw new InternalServerErrorException(
        'O identificador Laqus não foi retornado',
      );
    }

    const atualizadoComIdentificadorLaqus =
      await this.debentureSerieInvestidorRepositorio.atualizar({
        id: serie.id,
        status_retorno_laqus: 'Pendente',
      });

    if (!atualizadoComIdentificadorLaqus) {
      throw new InternalServerErrorException(
        'Não foi possível atualizar o status do retorno Laqus',
      );
    }
    return retornoLaqus;
  }
}
