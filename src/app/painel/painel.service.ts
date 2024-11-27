import { Injectable } from '@nestjs/common';
import { sigmaHeaders } from '../autenticacao/constants';

@Injectable()
export class PainelService {
  private headers: HeadersInit;

  constructor() {
    this.headers = sigmaHeaders as HeadersInit;
  }

  async obterRentabilidadeGeral(cnpj: string, idUsuario: number) {
    const options = {
      headers: this.headers,
    };

    const urlSigmaPorCnpj = `${process.env.ATIVOS_URL}/ativos-disponiveis/v1/ativos/rentabibilidade?identificadorInvestidor=${cnpj}`;
    const urlSigmaPorIdUsuario = `${process.env.ATIVOS_URL}/ativos-disponiveis/v1/ativos/rentabibilidade-consolidado?identificadorInvestidor=${idUsuario}`;

    const requestCnpj = await fetch(urlSigmaPorCnpj, options);
    const dadosCnpj = await requestCnpj.json();

    delete dadosCnpj.rendimentosAtivosConsolidado;

    const responseIdUsuario = await fetch(urlSigmaPorIdUsuario, options);
    const contentType = responseIdUsuario.headers.get('Content-Type');

    let dadosIdUsuario = {
      valorAberto: 0,
      valorEsperado: 0,
      porcentagemRendimentoGeral: 0,
    };
    if (contentType === 'application/json') {
      dadosIdUsuario = await responseIdUsuario.json();
    }

    const dadosCombinados = {
      ...dadosCnpj,
      rendimentosAtivosConsolidado: dadosIdUsuario,
    };

    return dadosCombinados;
  }

  async obterPortfolio(cnpj: string) {
    const options = {
      headers: this.headers,
    };

    const urlSigma = `${process.env.ATIVOS_URL}/ativos-disponiveis/v1/ativos/rentabibilidade/carteira?identificadorInvestidor=${cnpj}`;
    const rentabilitySigma = await fetch(urlSigma, options);
    const dataSigma = await rentabilitySigma.json();

    return dataSigma;
  }
}
