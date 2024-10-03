import { Injectable } from '@nestjs/common';
import { QueryDto } from './dto/query-ativos.dto';
import { Ativo } from './entities/ativo.entity';
import { sigmaHeaders } from '../auth/constants';

@Injectable()
export class AtivosService {
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
    const sigmaFetch = await fetch(urlSigmaParaObterTotalItens, options);
    const data = await sigmaFetch.json();
    itensSigma = data.content;

    const ativosComDadosEmpresa = await Promise.all(
      itensSigma.map(async (ativo: any) => {
        const identificacaoAtivo = ativo.cedente.identificacao;
        const urlEmpresaSigma = `${process.env.ATIVOS_URL}/ativos-disponiveis/v1/ativos/cedente/${identificacaoAtivo}`;
        const empresaSigma = await fetch(urlEmpresaSigma, options);
        const dadosEmpresaSigma = await empresaSigma.json();
        return { ...ativo, empresa: { ...dadosEmpresaSigma } };
      }),
    );

    const itens = ativosComDadosEmpresa
      .filter((ativo) => ativo.tir > 0 && ativo.cedente.scoreInterno !== 'F')
      .map((ativo) => {
        let novoAtivo = ativo;
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

    const sigmaFetch = await fetch(urlSigma, options);
    const data = await sigmaFetch.json();

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
