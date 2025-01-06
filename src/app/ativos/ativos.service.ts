import { Injectable } from '@nestjs/common';
import { QueryDto } from './dto/query-ativos.dto';
import { Ativo } from './entities/ativo.entity';
import { sigmaHeaders } from '../autenticacao/constants';
import { tratarErroRequisicao } from 'src/utils/funcoes/erros';
import { ErroServidorInterno } from 'src/helpers/erroAplicacao';
import { LogService } from '../global/logs/log.service';

@Injectable()
export class AtivosService {
  constructor(private readonly logService: LogService) {}
  async encontrarTodosAtivos(params: QueryDto) {
    let ativos: Ativo[] | null = null;

    if (params.scores) {
      params.scores = params.scores
        .split(',')
        .map((score: string) => {
          switch (score.toLocaleUpperCase()) {
            case 'A':
              return 'A,B';
            case 'B':
              return 'C';
            case 'C':
              return 'D';
            case 'D':
              return 'E';
          }
        })
        .join(',');
    }

    const options = {
      headers: sigmaHeaders,
    };

    let itensSigma: Ativo[] = [];
    const urlSigmaParaObterTotalItens = this.construirUrlComFiltros(params);
    const req = await fetch(urlSigmaParaObterTotalItens, options);
    if (!req.ok) {
      await tratarErroRequisicao({
        acao: 'AtivosService.encontrarTodosAtivos',
        mensagem: 'Erro ao buscar os ativos',
        req,
        detalhes: {
          status: req.status,
          texto: req.statusText,
          url: req.url,
        },
      });
    }
    const data = await req.json();
    itensSigma = data.content;

    const ativosComDadosEmpresa = await itensSigma.reduce(
      async (accPromise, ativo: any) => {
        const acc = await accPromise;
        try {
          const identificacaoAtivo = ativo.cedente.identificacao;
          const urlEmpresaSigma = `${process.env.ATIVOS_URL}/ativos-disponiveis/v1/ativos/cedente/${identificacaoAtivo}`;
          const reqEmpresaSigma = await fetch(urlEmpresaSigma, options);

          if (!reqEmpresaSigma.ok) {
            throw new Error();
          }

          const dadosEmpresaSigma = await reqEmpresaSigma.json();
          acc.push({ ...ativo, empresa: { ...dadosEmpresaSigma } });
        } catch (error) {
          this.logService.info({
            mensagem: 'Erro Ao encontrar dados da empresa do ativo.',
            acao: 'AtivosService.encontrarTodosAtivos',
            exibirNoConsole: true,
            detalhes: {
              ativo: ativo.cedente.identificacao,
            },
          });
        }
        return acc;
      },
      Promise.resolve([]),
    );

    console.log(ativosComDadosEmpresa);

    if (!ativosComDadosEmpresa) {
      throw new ErroServidorInterno({
        acao: 'AtivosService.encontrarTodosAtivos',
        mensagem: 'Não possível retornar ativos com dados de empresa',
      });
    }
    const itens = ativosComDadosEmpresa
      .filter((ativo) => ativo.tir > 0 && ativo.cedente.scoreInterno !== 'F')
      .map((ativo) => {
        const novoAtivo = ativo;
        switch (ativo.cedente.scoreInterno) {
          case 'B':
            novoAtivo.cedente.scoreInterno = 'A';
            break;
          case 'C':
            novoAtivo.cedente.scoreInterno = 'B';
            break;
          case 'D':
            novoAtivo.cedente.scoreInterno = 'C';
            break;
          case 'E':
            novoAtivo.cedente.scoreInterno = 'D';
            break;
        }
        return novoAtivo;
      });

    ativos = itens;

    const proximaPagina =
      data.totalRegistros == 6 ? Number(params.page!) + 1 : null;

    return {
      data: {
        proximaPagina: proximaPagina,
        itens: ativos,
      },
    };
  }

  async geral() {
    const options = {
      headers: sigmaHeaders,
    };

    const urlSigma = `${process.env.ATIVOS_URL}/ativos-disponiveis/v1/ativos/geral`;

    const req = await fetch(urlSigma, options);
    if (!req.ok) {
      await tratarErroRequisicao({
        acao: 'AtivosService.geral',
        mensagem: 'Erro ao buscar os ativos',
        req,
        detalhes: {
          status: req.status,
          texto: req.statusText,
          url: req.url,
        },
      });
    }
    const data = await req.json();

    return data;
  }

  private construirUrlComFiltros(params: QueryDto): string {
    const baseUrl = `${process.env.ATIVOS_URL}/ativos-disponiveis/v1/ativos/disponiveis`;

    const url = new URL(baseUrl);
    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlParams.append(key, String(value));
      }
    });

    url.search = urlParams.toString();
    return url.toString();
  }
}
