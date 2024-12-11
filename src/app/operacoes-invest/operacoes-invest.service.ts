import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErroAplicacao, ErroServidorInterno } from 'src/helpers/erroAplicacao';

@Injectable()
export class OperacoesInvestService {
  constructor(private readonly configService: ConfigService) {}

  async buscarTransacaoPorCodigoOperacao(codigoOperacao: number) {
    try {
      const url = `${process.env.BASE_URL_OPERACAO__INVEST}${codigoOperacao}`;

      const req = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.X_API_KEY,
        },
      });

      if (!req.ok) {
        throw new InternalServerErrorException(
          'Ocorreu um erro ao buscar as operações',
        );
      }

      const result = await req.json();
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Ocorreu um erro ao buscar as operações',
      );
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
          'X-API-KEY': process.env.X_API_KEY,
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

      const result = await req.json();
      return result;
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        mensagem: 'Ocorreu um erro ao buscar as operações',
        acao: 'operacaoInvestService.buscarTodasOperacoes',
        informacaoAdicional: { error },
      });
    }
  }
}
