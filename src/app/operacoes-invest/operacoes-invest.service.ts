import { Injectable } from '@nestjs/common';
import { OperacaoInvest } from 'src/@types/entities/operacao';
import { ErroAplicacao, ErroServidorInterno } from 'src/helpers/erroAplicacao';

@Injectable()
export class OperacoesInvestService {
  constructor() {}

  async buscarTransacaoPorCodigoOperacao(codigoOperacao: number) {
    try {
      const url = `${process.env.BASE_URL_OPERACAO__INVEST}${codigoOperacao}`;

      const req = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.FLUXO_OPERACIONAL_SECRET_KEY,
        },
      });

      if (!req.ok) {
        throw new ErroServidorInterno({
          mensagem: 'Ocorreu um erro ao buscar as operações',
          acao: 'operacoesInvest.buscarTransacaoPorCodigoOperacao',
          informacaoAdicional: { codigoOperacao },
        });
      }

      const result = (await req.json()) as OperacaoInvest;
      return result;
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        mensagem: 'Ocorreu um erro ao buscar as operações',
        acao: 'operacoesInvest.buscarTransacaoPorCodigoOperacao.catch',
        informacaoAdicional: { codigoOperacao },
      });
    }
  }

  async buscarTodasOperacoes() {
    try {
      const url = `${process.env.BASE_URL_OPERACAO_INVEST}`;

      const req = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.FLUXO_OPERACIONAL_SECRET_KEY,
        },
      });

      if (!req.ok) {
        throw new ErroServidorInterno({
          mensagem: 'Ocorreu um erro ao buscar as operações',
          acao: 'operacoesInvest.buscarTodasOperacoes',
        });
      }

      const result = (await req.json()) as OperacaoInvest[];
      return result;
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        mensagem: 'Ocorreu um erro ao buscar as operações',
        acao: 'operacoesInvest.buscarTodasOperacoes.catch',
      });
    }
  }
}
