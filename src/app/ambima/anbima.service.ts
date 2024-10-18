import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnbimaService {
  private tokenAcessoAnbima: string | null = null;
  private ultimoAuthAnbima: Date | null = null;

  constructor(private readonly configService: ConfigService) {}

  private async autenticarAnbima() {
    const trintaMinutosEmMilissegundos = 30 * 60 * 1000;

    if (
      !this.ultimoAuthAnbima ||
      new Date().getTime() - this.ultimoAuthAnbima.getTime() >=
        trintaMinutosEmMilissegundos
    ) {
      const urlAutenticacao = `${this.configService.get('ANBIMA_BASE_URL')}/oauth/access-token`;

      const resposta = await fetch(urlAutenticacao, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.configService.get('ANBIMA_AUTH')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grant_type: 'client_credentials' }),
      });

      const dadosAutenticacao = await resposta.json();
      this.tokenAcessoAnbima = dadosAutenticacao.access_token;
      this.ultimoAuthAnbima = new Date();
    }
  }

  async buscarFundosPorCnpj(cnpj: string, pagina = 0): Promise<any | null> {
    await this.autenticarAnbima();

    const url = `${this.configService.get('ANBIMA_BASE_URL')}/feed/fundos/v2/fundos?page=${pagina}`;
    const cnpjLimpo = cnpj.replace(/[.\-\/]/g, '');

    const resposta = await fetch(url, {
      headers: {
        client_id: this.configService.get('ANBIMA_CLIENT_ID'),
        access_token: this.tokenAcessoAnbima!,
      },
    });

    const fundos = await resposta.json();
    const totalElementos = fundos.totalSize;
    const tamanhoPagina = fundos.pageable.size;
    const totalPaginas = Math.ceil(totalElementos / tamanhoPagina) - 1;

    const fundoSelecionado = fundos.content.find((fundo) => {
      return (
        fundo.tipo_identificador_fundo.toUpperCase() === 'CNPJ' &&
        fundo.identificador_fundo === cnpjLimpo
      );
    });

    if (!fundoSelecionado && pagina < totalPaginas) {
      return this.buscarFundosPorCnpj(cnpj, pagina + 1);
    }

    return fundoSelecionado || null;
  }

  async buscarDetalhesFundoPorCodigoAnbima(codigoAnbima: string): Promise<any> {
    await this.autenticarAnbima();

    const url = `${this.configService.get('ANBIMA_BASE_URL')}/feed/fundos/v2/fundos/${codigoAnbima}`;

    const resposta = await fetch(url, {
      headers: {
        client_id: this.configService.get('ANBIMA_CLIENT_ID'),
        access_token: this.tokenAcessoAnbima!,
      },
    });

    return await resposta.json();
  }

  async buscarSerieHistoricaPorCodigoClasse(
    codigoClasse: string,
  ): Promise<any> {
    await this.autenticarAnbima();

    const url = `${this.configService.get('ANBIMA_BASE_URL')}/feed/fundos/v2/fundos/${codigoClasse}/serie-historica`;

    const resposta = await fetch(url, {
      headers: {
        client_id: this.configService.get('ANBIMA_CLIENT_ID'),
        access_token: this.tokenAcessoAnbima!,
      },
    });

    return await resposta.json();
  }
}
