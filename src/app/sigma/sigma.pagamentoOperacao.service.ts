import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContaInvestidorRepositorio } from 'src/repositorios/contratos/contaInvestidorRespositorio';
import { sigmaHeaders } from '../autenticacao/constants';
import { tratarErroRequisicao } from 'src/utils/funcoes/erros';
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

    const req = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    if (!req.ok) {
      await tratarErroRequisicao({
        acao: 'pagamentoOperacao.incluirPagamento.fetch',
        mensagem: `Erro ao incluir pagamento: ${req.status}`,
        req,
        detalhes: {
          status: req.status,
          texto: req.statusText,
        },
      });
    }

    return await req.json();
  }
}
