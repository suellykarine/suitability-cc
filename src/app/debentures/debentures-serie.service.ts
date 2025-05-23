import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DebentureRepositorio } from 'src/repositorios/contratos/debentureRepositorio';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import {
  AtualizarValorSerie,
  DebentureSerie,
  DebentureSerieInvestidor,
} from 'src/@types/entities/debenture';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { ContaInvestidorRepositorio } from 'src/repositorios/contratos/contaInvestidorRespositorio';
import { LaqusService } from '../laqus/laqus.service';
import { SrmBankService } from '../srm-bank/srm-bank.service';
import { AdaptadorDb } from 'src/adaptadores/db/adaptadorDb';
import { CriarDebentureSerieDto } from './dto/criar-debenure-serie.dto';
import {
  encontrarSerieComValorAproximado,
  filtrarSeriesPorValor,
} from './utils/estaAptoAEstruturar';

import { OperacaoDebentureRepositorio } from 'src/repositorios/contratos/operacaoDebentureRepositorio';
import {
  ErroAplicacao,
  ErroNaoEncontrado,
  ErroRequisicaoInvalida,
  ErroServidorInterno,
} from 'src/helpers/erroAplicacao';
import { LogService } from '../global/logs/log.service';
import { CreditSecSerieService } from '../credit-sec/modules/credit-sec-serie/credit-sec-serie.service';

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
    private readonly logService: LogService,
    private readonly srmBankService: SrmBankService,
    @Inject(forwardRef(() => CreditSecSerieService))
    private readonly creditSecSerieService: CreditSecSerieService,
    private readonly adaptadorDb: AdaptadorDb,
    private readonly operacaoDebentureRepositorio: OperacaoDebentureRepositorio,
  ) {}

  async solicitarSerie({
    valorEntrada,
    identificadorFundo,
  }: CriarDebentureSerieDto): Promise<DebentureSerie | undefined> {
    const debenture = await this.debentureRepositorio.buscarAtiva();

    if (!debenture) {
      throw new ErroNaoEncontrado({
        mensagem: 'Debenture não encontrada',
        acao: 'debentureSerieService.solicitarSerie',
      });
    }

    const idDebenture = debenture.id;

    const fundo =
      await this.prismaFundoInvestimentoRepositorio.encontrarPorId(
        identificadorFundo,
      );

    if (!fundo) {
      throw new ErroNaoEncontrado({
        mensagem: 'Fundo de investimento não encontrado',
        acao: 'debentureSerieService.solicitarSerie',
        detalhes: {
          identificadorFundo,
        },
      });
    }

    if (!valorEntrada) {
      throw new ErroRequisicaoInvalida({
        mensagem:
          'Valor série não enviado ou fundo não possuí um valor de serie',
        acao: 'debentureSerieService.solicitarSerie',
        detalhes: {
          valorEntrada,
          fundo,
        },
      });
    }

    const debentureSerieInvestidorDesvinculado =
      await this.debentureSerieInvestidorRepositorio.encontrarPorDesvinculo({
        idDebenture,
      });
    const debentureSerieDesvinculada =
      debentureSerieInvestidorDesvinculado?.debenture_serie;

    const ultimoVinculoDSI =
      await this.debentureSerieInvestidorRepositorio.encontrarMaisRecentePorIdFundoInvestimento(
        { id_fundo_investimento: identificadorFundo },
      );

    const { status_retorno_laqus, codigo_investidor_laqus } =
      ultimoVinculoDSI ?? {};

    const fundoReprovadoLaqus = status_retorno_laqus === 'REPROVADO';
    if (fundoReprovadoLaqus)
      throw new ErroRequisicaoInvalida({
        mensagem: 'O investidor está reprovado pela Laqus',
        acao: 'debentureSerieService.solicitarSerie',
        detalhes: {
          debentureSerieInvestidor: ultimoVinculoDSI,
        },
      });

    const fundoPendenteLaqus = status_retorno_laqus === 'PENDENTE';

    if (fundoPendenteLaqus) {
      throw new ErroRequisicaoInvalida({
        mensagem: 'O investidor está com cadastro pendente na Laqus',
        acao: 'debentureSerieService.solicitarSerie',
        detalhes: {
          debentureSerieInvestidor: ultimoVinculoDSI,
        },
      });
    }
    const fundoErroLaqus = status_retorno_laqus === 'ERRO';

    if (fundoErroLaqus) {
      await this.laqusService.cadastrarInvestidor(ultimoVinculoDSI.id);

      await this.logService.info({
        mensagem:
          'Série criada com sucesso, mediante atualização do erro de cadastro da laqus',
        detalhes: {
          debentureSerieInvestidorCriada: ultimoVinculoDSI,
          idFundoInvestimento: identificadorFundo,
        },
      });

      return ultimoVinculoDSI.debenture_serie;
    }
    const fundoNovoLaqus = !status_retorno_laqus;

    if (!!debentureSerieDesvinculada) {
      const valorSerieDesvinculada = Number(
        debentureSerieInvestidorDesvinculado?.debenture_serie?.valor_serie,
      );
      const serieEncontradaIgualValorAtual =
        valorEntrada === valorSerieDesvinculada;

      const debentureSerieInvestidorCriada =
        await this.adaptadorDb.fazerTransacao(async () => {
          if (!serieEncontradaIgualValorAtual) {
            this.atualizarValorDaSerie({
              idDebentureSerie:
                debentureSerieInvestidorDesvinculado.id_debenture_serie,
              valorSerie: valorEntrada,
            });
          }

          const debentureSerieInvestidorCriada =
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

          return debentureSerieInvestidorCriada;
        }, [
          this.debentureSerieRepositorio,
          this.debentureSerieInvestidorRepositorio,
          this.contaInvestidorRepositorio,
        ]);

      if (fundoNovoLaqus) {
        try {
          await this.laqusService.cadastrarInvestidor(
            debentureSerieInvestidorCriada.id,
          );
        } catch (error) {
          await this.debentureSerieInvestidorRepositorio.atualizar({
            id: debentureSerieInvestidorCriada.id,
            status_retorno_laqus: 'ERRO',
            mensagem_retorno_laqus: 'Falha ao criar cadastro na Laqus',
          });
          if (error instanceof ErroAplicacao) throw error;
          throw new ErroServidorInterno({
            mensagem: 'Falha ao criar cadastro na Laqus',
            acao: 'debentureSerieService.solicitarSerie.cadastrarInvestidorLaqus',
            detalhes: {
              debentureSerieInvestidorCriada,
            },
          });
        }
      } else {
        await this.creditSecSerieService.solicitarSerie(
          debentureSerieInvestidorCriada.id,
        );
      }

      return debentureSerieInvestidorCriada.debenture_serie;
    }

    const debentureSerieInvestidorEncerrado =
      await this.debentureSerieInvestidorRepositorio.encontrarPorEncerramento();

    const debentureSerieInvestidorCriada =
      await this.adaptadorDb.fazerTransacao(
        async () => {
          const novaSerie = await this.criarNovaSerie({
            idDebenture: idDebenture,
            valorSerie: valorEntrada,
          });
          if (debentureSerieInvestidorEncerrado) {
            const idContaInvestidor =
              debentureSerieInvestidorEncerrado.id_conta_investidor;
            const debentureSerieInvestidorCriada =
              await this.reutilizarTabelaContaInvestidorECriarDebentureSerieInvestidor(
                {
                  idDebentureSerie: novaSerie.id,
                  idContaInvestidor,
                  idFundoInvestimento: identificadorFundo,
                  idLaqus: codigo_investidor_laqus,
                  statusLaqus: status_retorno_laqus,
                },
              );

            return debentureSerieInvestidorCriada;
          }

          const novaContaInvestidor =
            await this.srmBankService.criarContaInvestidor(identificadorFundo);

          const debentureSerieInvestidorCriada =
            await this.criarDebentureSerieInvestidor({
              idContaInvestidor: novaContaInvestidor.conta_investidor?.id,
              idDebentureSerie: novaSerie.id,
              idFundoInvestimento: fundo.id,
              idLaqus: codigo_investidor_laqus,
              statusLaqus: status_retorno_laqus,
            });

          return debentureSerieInvestidorCriada;
        },
        [
          this.debentureSerieRepositorio,
          this.debentureSerieInvestidorRepositorio,
          this.contaInvestidorRepositorio,
        ],
        { timeout: 80000 },
      );

    if (fundoNovoLaqus) {
      try {
        await this.laqusService.cadastrarInvestidor(
          debentureSerieInvestidorCriada.id,
        );
      } catch (error) {
        await this.debentureSerieInvestidorRepositorio.atualizar({
          id: debentureSerieInvestidorCriada.id,
          status_retorno_laqus: 'ERRO',
          mensagem_retorno_laqus: 'Falha ao criar cadastro na Laqus',
        });
        if (error instanceof ErroAplicacao) throw error;
        throw new ErroServidorInterno({
          mensagem: 'Falha ao criar cadastro na Laqus',
          acao: 'debentureSerieService.solicitarSerie.cadastrarInvestidorLaqus',
          detalhes: {
            debentureSerieInvestidorCriada,
          },
        });
      }
      await this.logService.info({
        mensagem: 'Série criada com sucesso',
        detalhes: {
          debentureSerieInvestidorCriada,
          idFundoInvestimento: identificadorFundo,
        },
      });
      return debentureSerieInvestidorCriada.debenture_serie;
    } else {
      await this.creditSecSerieService.solicitarSerie(
        debentureSerieInvestidorCriada.id,
      );
    }
    await this.logService.info({
      mensagem: 'Série criada com sucesso',
      detalhes: {
        debentureSerieInvestidorCriada,
        idFundoInvestimento: identificadorFundo,
      },
    });

    return debentureSerieInvestidorCriada.debenture_serie;
  }

  async solicitarSerieBackOffice(payload: CriarDebentureSerieDto) {
    await this.fundoInvestimentoRepositorio.atualizar(
      payload.identificadorFundo,
      { valor_serie_debenture: payload.valorEntrada, apto_debenture: true },
    );
    const serieSolicitada = await this.solicitarSerie(payload);

    return serieSolicitada;
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
  }): Promise<DebentureSerieInvestidor> {
    await this.contaInvestidorRepositorio.atualizar(idContaInvestidor, {
      id_fundo_investidor: idFundoInvestimento,
    });
    return await this.criarDebentureSerieInvestidor({
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
      status_retorno_laqus: statusLaqus || 'PENDENTE',
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
      throw new ErroRequisicaoInvalida({
        acao: 'debentureSerieService.criarNovaSerie',
        mensagem: 'Limite de séries atingido',
        detalhes: {
          idDebenture: idDebenture,
          seriesExistentesQtd: seriesExistentesQtd,
        },
      });
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
      throw new ErroNaoEncontrado({
        acao: 'debentureSerieService.encontrarPorId',
        mensagem: 'Debenture serie não encontrada',
        detalhes: {
          id,
        },
      });
    }
    return debenture;
  }

  async atualizarValorDaSerie({
    idDebentureSerie,
    valorSerie,
  }: AtualizarValorSerie): Promise<DebentureSerie | null> {
    const debentureSerieSelecionada =
      await this.encontrarPorId(idDebentureSerie);

    if (!debentureSerieSelecionada)
      throw new ErroNaoEncontrado({
        acao: 'debentureSerieService.atualizarValorDaSerie',
        mensagem: 'Debenture serie não encontrada',
        detalhes: {
          idDebentureSerie,
          valorSerie,
        },
      });

    if (
      debentureSerieSelecionada.data_vencimento ||
      debentureSerieSelecionada.data_emissao
    )
      throw new ErroRequisicaoInvalida({
        acao: 'debentureSerieService.atualizarValorDaSerie',
        mensagem:
          'A série já foi aprovada pela creditSec, logo não é mais possível atualizar o valor da mesma',
        detalhes: {
          debentureSerieSelecionada,
        },
      });

    const seriesExistentes =
      await this.debentureSerieRepositorio.encontrarSeriesPorIdDebenture(
        debentureSerieSelecionada.id_debenture,
      );

    const seriesParaVerificarLimite = seriesExistentes.filter(
      (serie) => serie.id !== debentureSerieSelecionada?.id,
    );

    this.verificarLimiteDebenture(seriesParaVerificarLimite, valorSerie);

    const atualizado = await this.debentureSerieRepositorio.atualizar(
      debentureSerieSelecionada.id,
      { valor_serie: valorSerie },
    );
    if (!atualizado)
      throw new ErroServidorInterno({
        acao: 'debentureSerieService.atualizarValorDaSerie',
        mensagem: 'Erro ao atualizar valor da série',
        detalhes: {
          idDebentureSerie,
          valorSerie,
        },
      });
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
    return this.adaptadorDb.fazerTransacao(
      async () => {
        const estaApto =
          await this.fundoInvestimentoRepositorio.buscarEstaAptoADebentureRepositorio(
            idInvestidor,
          );

        if (!estaApto) {
          throw new ErroRequisicaoInvalida({
            acao: 'debentureSerieService.estaAptoAEstruturar',
            mensagem: 'Fundo de investimento não está apto a debenture',
            detalhes: {
              idInvestidor,
            },
          });
        }

        const debenture = await this.debentureRepositorio.buscarAtiva();

        const seriesAptasAInvestir =
          await this.debentureSerieInvestidorRepositorio.buscarTodasSeriesAptasParaInvestir(
            { idDebenture: debenture.id, idFundoInvestimento: idInvestidor },
          );

        if (seriesAptasAInvestir.length === 0) {
          throw new ErroNaoEncontrado({
            acao: 'debentureSerieService.estaAptoAEstruturar',
            mensagem: 'Séries aptas do investidor não encontradas',
            detalhes: {
              idInvestidor,
            },
          });
        }

        const seriesComSaldoSuficiente = filtrarSeriesPorValor({
          series: seriesAptasAInvestir,
          valorEntrada,
        });

        if (seriesComSaldoSuficiente.length > 0) {
          const serieMaisApropriada = encontrarSerieComValorAproximado({
            series: seriesComSaldoSuficiente,
            valorEntrada,
          });
          return {
            mensagem: 'Série com saldo encontrada',
            data: serieMaisApropriada,
          };
        }
        const fundoInvestimento =
          await this.fundoInvestimentoRepositorio.encontrarPorId(idInvestidor);
        if (!fundoInvestimento) {
          throw new ErroNaoEncontrado({
            acao: 'debentureSerieService.estaAptoAEstruturar',
            mensagem: 'Fundo de investimento não encontrado',
            detalhes: {
              idInvestidor,
            },
          });
        }

        if (!fundoInvestimento.valor_serie_debenture)
          throw new ErroNaoEncontrado({
            acao: 'debentureSerieService.estaAptoAEstruturar',
            mensagem:
              'O valor de série do fundo não foi definido pelo BackOffice',
            detalhes: {
              fundoInvestimento,
            },
          });

        const saldoNovaDebentureSerie =
          valorEntrada > fundoInvestimento.valor_serie_debenture
            ? valorEntrada
            : fundoInvestimento.valor_serie_debenture;
        const novaSerie = await this.solicitarSerie({
          valorEntrada: saldoNovaDebentureSerie,
          identificadorFundo: idInvestidor,
        });
        if (!novaSerie) {
          throw new ErroServidorInterno({
            acao: 'debentureSerieService.estaAptoAEstruturar',
            mensagem: 'Não foi possível criar uma nova serie',
            detalhes: {
              idInvestidor,
              valorEntrada,
            },
          });
        }

        const novaDSI =
          await this.debentureSerieInvestidorRepositorio.encontrarMaisRecentePorIdFundoInvestimento(
            { id_fundo_investimento: idInvestidor },
          );

        const novaDSIAtualizada =
          await this.debentureSerieInvestidorRepositorio.atualizar({
            id: novaDSI.id,
            status_retorno_creditsec: 'LIBERADO',
          });

        if (!novaDSIAtualizada) {
          throw new ErroServidorInterno({
            acao: 'debentureSerieService.estaAptoAEstruturar',
            mensagem: 'Não foi possível atualizar a DSI',
            detalhes: {
              novaSerie,
              idInvestidor,
              valorEntrada,
            },
          });
        }

        return {
          mensagem: 'Serie com saldo encontrada',
          data: novaSerie,
        };
      },
      [
        this.debentureSerieRepositorio,
        this.debentureSerieInvestidorRepositorio,
        this.contaInvestidorRepositorio,
      ],
      { timeout: 80000 },
    );
  }

  async estornoBaixaValorSerie(idDebentureSerie: number, valorEntrada: number) {
    return this.atualizarValorSerie(
      idDebentureSerie,
      (valorAtual) => valorAtual - valorEntrada,
    );
  }

  async registroBaixaValorSerie(
    idDebentureSerie: number,
    valorEntrada: number,
  ) {
    return this.atualizarValorSerie(
      idDebentureSerie,
      (valorAtual) => valorAtual + valorEntrada,
    );
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
      throw new ErroRequisicaoInvalida({
        acao: 'debentureSerieService.verificarLimiteDebenture',
        mensagem: 'Limite de valor da debenture atingido',
        detalhes: {
          valorTotalSeriesExistentes,
          valorEntrada,
          limiteDebenture: this.limiteDebenture,
        },
      });
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

  async listarOperacoesPorGestorFundo(id: number) {
    try {
      return await this.operacaoDebentureRepositorio.buscarPorGestorFundo(id);
    } catch (erro) {
      if (erro instanceof ErroAplicacao) throw erro;
      throw new ErroServidorInterno({
        acao: 'debentureSerieService.listarOperacoesPorGestorFundo',
        mensagem: 'Erro ao buscar operações por gestor fundo',
        detalhes: {
          id,
        },
      });
    }
  }

  async listarTodasOperacoes() {
    try {
      return await this.operacaoDebentureRepositorio.buscarTodasOperacoes();
    } catch (error) {
      throw new ErroServidorInterno({
        acao: 'debentureSerieService.listarTodasOperacoes',
        mensagem: 'Erro ao buscar todas as operações.',
      });
    }
  }

  private async atualizarValorSerie(
    idDebentureSerie: number,
    calcularNovoValor: (valorAtual: number) => number,
  ) {
    const debentureSerie =
      await this.debentureSerieRepositorio.encontrarPorId(idDebentureSerie);

    if (!debentureSerie) {
      throw new ErroNaoEncontrado({
        acao: 'debentureSerieService.atualizarValorSerie',
        mensagem: 'Debenture série não encontrada',
        detalhes: {
          idDebentureSerie,
        },
      });
    }

    const debentureSerieAtualizada =
      await this.debentureSerieRepositorio.atualizar(debentureSerie.id, {
        valor_serie_investido: calcularNovoValor(
          debentureSerie.valor_serie_investido,
        ),
      });

    return debentureSerieAtualizada;
  }
}
