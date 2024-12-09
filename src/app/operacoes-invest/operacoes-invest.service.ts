import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class OperacoesInvestService {
  constructor() {}

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

  async buscarTodasOperacoes() {
    try {
      const url = `${process.env.BASE_URL_OPERACAO_INVEST}`;

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
}
