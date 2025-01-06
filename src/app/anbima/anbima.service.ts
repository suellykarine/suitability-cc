import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Fundo } from 'src/@types/entities/anbima';
import { GetSerieHistoricaData } from './types/returnData';
import { tratarErroRequisicao } from 'src/utils/funcoes/erros';

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

      const req = await fetch(urlAutenticacao, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.configService.get('ANBIMA_AUTH')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grant_type: 'client_credentials' }),
      });

      if (!req) {
        await tratarErroRequisicao({
          acao: 'anbimaService.autenticarAnbima',
          mensagem: `erro ao autenticar na anbiuma`,
          req,
          detalhes: {
            status: req.status,
            texto: req.statusText,
            body: req.body,
            url: req.url,
            urlAuth: urlAutenticacao,
          },
        });
      }

      const dadosAutenticacao = await req.json();
      this.tokenAcessoAnbima = dadosAutenticacao.access_token;
      this.ultimoAuthAnbima = new Date();
    }
  }

  async integracaoAnbima(cnpj: string) {
    await this.autenticarAnbima();
    const urlCnpjPublica = `${this.configService.get('CNPJ_API_PUBLICA')}/${cnpj}`;
    const reqCnpj = await fetch(urlCnpjPublica);

    if (!reqCnpj) {
      await tratarErroRequisicao({
        acao: 'AmbimaService.integracaoAnbima',
        mensagem: 'Erro na busca do CNPJ',
        req: reqCnpj,
        detalhes: {
          status: reqCnpj.status,
          texto: reqCnpj.statusText,
          url: reqCnpj.url,
        },
      });
    }
    const cnpjData = await reqCnpj.json();
    if (!reqCnpj.ok) {
      await tratarErroRequisicao({
        acao: 'AmbimaService.integracaoAnbima',
        mensagem: cnpjData.detalhes || 'Erro na busca do CNPJ',
        req: reqCnpj,
        detalhes: {
          status: cnpjData.status,
          texto: cnpjData.statusText,
          body: cnpjData.body,
          url: cnpjData.url,
        },
      });
    }

    if (cnpjData?.estabelecimento?.situacao_cadastral !== 'Ativa') {
      await tratarErroRequisicao({
        acao: 'AmbimaService.integracaoAnbima',
        mensagem: 'CNPJ inativo. Operação cancelada.',
        req: reqCnpj,
        detalhes: {
          status: 422,
          texto: reqCnpj.statusText,
          body: reqCnpj.body,
          url: reqCnpj.url,
          cnpj,
        },
      });
    }

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
      nomeFantasia: fundo.nome_comercial_fundo,
      codigoAnbima: fundo.codigo_fundo,
      razaoSocial: fundo.razao_social_fundo,
      cnpj: fundo.identificador_fundo,
      classeAnbima: fundo.classes[0].nivel1_categoria,
      urlRegulation: regulamento?.url,
      patrimonioLiquido: String(patrimonioLiquido),
    };
    return dadosFundo;
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

    const req = await fetch(url, {
      headers: {
        client_id: this.configService.get('ANBIMA_CLIENT_ID'),
        access_token: this.tokenAcessoAnbima!,
      },
    });
    if (!req) {
      await tratarErroRequisicao({
        acao: 'AmbimaService.buscarDetalhesFundoPorCodigoAnbima',
        mensagem: 'Erro ao buscar Detalhes do fundo por codigo ANBIMA',
        req: req,
        detalhes: {
          status: req.status,
          texto: req.statusText,
          body: req.body,
          url: req.url,
          codigoAnbima,
        },
      });
    }

    return await req.json();
  }

  async buscarSerieHistoricaPorCodigoClasse(
    codigoClasse: string,
  ): Promise<GetSerieHistoricaData> {
    await this.autenticarAnbima();

    const url = `${this.configService.get('ANBIMA_BASE_URL')}/feed/fundos/v2/fundos/${codigoClasse}/serie-historica`;

    const req = await fetch(url, {
      headers: {
        client_id: this.configService.get('ANBIMA_CLIENT_ID'),
        access_token: this.tokenAcessoAnbima!,
      },
    });
    if (!req) {
      await tratarErroRequisicao({
        acao: 'AmbimaService.buscarSerieHistoricaPorCodigoClasse',
        mensagem: 'Erro ao buscar serie historica por codigo',
        req: req,
        detalhes: {
          status: req.status,
          texto: req.statusText,
          body: req.body,
          url: req.url,
          codigo: codigoClasse,
        },
      });
    }
    return await req.json();
  }
}
