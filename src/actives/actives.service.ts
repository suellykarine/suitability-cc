import { Injectable } from '@nestjs/common';
import { QueryDto } from './dto/query-actives.dto';
import { Active } from './entities/active.entity';
import { sigmaHeaders } from 'src/auth/constants';

@Injectable()
export class ActivesService {
  async findAll(params: QueryDto) {
    let actives: Active[] | null = null;

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

    let itemsSigma: Active[] = [];
    const urlSigmaToGetTotalItems = this.buildUrlWithFilters(params);
    const sigmaFetch = await fetch(urlSigmaToGetTotalItems, options);
    const data = await sigmaFetch.json();
    itemsSigma = data.content;

    const activesWithCompanyData = await Promise.all(
      itemsSigma.map(async (active: any) => {
        const identifyActive = active.cedente.identificacao;
        const urlCompanySigma = `${process.env.ATIVOS_URL}/ativos-disponiveis/v1/ativos/cedente/${identifyActive}`;
        const companySigma = await fetch(urlCompanySigma, options);
        const dataSigma = await companySigma.json();
        return { ...active, empresa: { ...dataSigma } };
      }),
    );

    const items = activesWithCompanyData
      .filter((active) => active.tir > 0 && active.cedente.scoreInterno !== 'F')
      .map((active) => {
        let newActive = active;
        switch (active.cedente.scoreInterno) {
          case 'B':
            newActive.cedente.scoreInterno = 'A';
            break;
          case 'C':
            newActive.cedente.scoreInterno = 'B';
            break;
          case 'D':
            newActive.cedente.scoreInterno = 'C';
            break;
          case 'E':
            newActive.cedente.scoreInterno = 'D';
            break;
        }
        return newActive;
      });

    actives = items;

    const nextPage = data.totalRegistros == 6 ? Number(params.page!) + 1 : null;

    return {
      data: {
        proximaPagina: nextPage,
        items: actives,
      },
    };
  }

  async general() {
    const options = {
      headers: sigmaHeaders,
    };

    const urlSigma = `${process.env.ATIVOS_URL}/ativos-disponiveis/v1/ativos/geral`;

    const sigmaFetch = await fetch(urlSigma, options);
    const data = await sigmaFetch.json();

    return data;
  }

  private buildUrlWithFilters(params: QueryDto): string {
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
