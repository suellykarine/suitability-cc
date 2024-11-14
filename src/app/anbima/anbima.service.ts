import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Fundo } from 'src/@types/entities/anbima';
import { GetSerieHistoricaData } from './types/returnData';

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

  async integracaoAnbima(cnpj: string) {
    try {
      await this.autenticarAnbima();
      const fundo = await this.buscarFundosPorCnpj(cnpj);
      if (!fundo) return null;
      const serieHistorica = await this.buscarSerieHistoricaPorCodigoClasse(
        fundo.classes[0].codigo_classe,
      );
      const detalhesFundo = await this.buscarDetalhesFundoPorCodigoAnbima(
        fundo.codigo_fundo,
      );
      const patrimonioLiquido =
        serieHistorica?.content?.[0].valor_patrimonio_liquido ?? 1;

      if (!detalhesFundo) return null;
      const regulamento = detalhesFundo.documentos?.find(
        (doc: any) => doc.tipo_documento == 'Regulamento',
      );

      const dadosFundo = {
        nome_fantasia_do_fundo: fundo.nome_comercial_fundo,
        codigo_anbima: fundo.codigo_fundo,
        razao_social_do_fundo: fundo.razao_social_fundo,
        cnpj_fundo: fundo.identificador_fundo,
        classe_anbima: fundo.classes[0].nivel1_categoria,
        urlRegulation: regulamento?.url,
        patrimonio_liquido: String(patrimonioLiquido),
      };
      return dadosFundo;
    } catch (err) {
      throw new InternalServerErrorException('Ocorreu um erro inesperado');
    }
  }

  async buscarFundosPorCnpj(cnpj: string, pagina = 0): Promise<Fundo | null> {
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

    if (!fundoSelecionado && pagina < totalPaginas)
      return this.buscarFundosPorCnpj(cnpj, pagina + 1);

    if (!fundoSelecionado) throw new NotFoundException('Fundo não encontrado');

    return fundoSelecionado;
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
  ): Promise<GetSerieHistoricaData> {
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
