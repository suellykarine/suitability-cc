import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from 'src/app/auth/constants';
import { ContaInvestidorRepositorio } from 'src/repositorios/contratos/contaInvestidorRespositorio';
@Injectable()
export class PagamentoOperacaoService {
  private readonly urlBase: string;
  constructor(
    private readonly contaInvestidorRepositorio: ContaInvestidorRepositorio,
    private readonly configService: ConfigService,
  ) {
    this.urlBase = this.configService.get<string>('URL_PAGAMENTO_OPERACAO');
  }

  async incluirPagamento(codigoOperacao: number, idContaInvestidor: number) {
    const conta =
      await this.contaInvestidorRepositorio.buscarContaPorId(idContaInvestidor);

    if (!conta || !conta.codigo_conta) {
      throw new BadRequestException('Conta não encontrada ou inválida');
    }

    const url = `${this.urlBase}/${codigoOperacao}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': sigmaHeaders['X-API-KEY'],
    };
    const body = JSON.stringify({ codigoContaCedente: conta.codigo_conta });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new HttpException(errorData, response.status);
    }

    return await response.json();
  }
}
