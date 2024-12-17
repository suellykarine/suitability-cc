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

  async buscarTodasOperacoes(identificadorInvestidor: string) {
    try {
      const credictConnectCedente = process.env.IDENTIFICADOR_CEDENTE;
      const url = `${process.env.BASE_URL_OPERACAO_INVEST}?identificadorCedente=${credictConnectCedente}`;
      const urlMontada =
        url +
        (identificadorInvestidor
          ? `?identificadorInvestidor=${identificadorInvestidor}`
          : '');

      const req = await fetch(urlMontada, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.FLUXO_OPERACIONAL_SECRET_KEY,
        },
      });

      if (!req.ok) {
        const resposta = await req.json();
        throw new ErroServidorInterno({
          mensagem: 'Ocorreu um erro ao buscar as operações',
          acao: 'operacaoInvestService.buscarTodasOperacoes',
          informacaoAdicional: { req, resposta },
        });
      }

      const result = (await req.json()) as OperacaoInvest[];
      return result;
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        mensagem: 'Ocorreu um erro ao buscar as operações',
        acao: 'operacaoInvestService.buscarTodasOperacoes.catch',
        informacaoAdicional: { error },
      });
    }
  }
}
