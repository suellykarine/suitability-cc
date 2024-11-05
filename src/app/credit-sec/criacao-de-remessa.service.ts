import { HttpException, Injectable } from '@nestjs/common';
import { sigmaHeaders } from 'src/app/auth/constants';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import { BodyCriacaoRemessaDto } from './dto/body-callback.dto';
import {
  NumerosSolicitarRemessa,
  OperacoesCedente,
  SolicitarRemessaType,
} from './interface/interface';
import { AtivosInvest } from 'src/@types/entities/ativoInvestido';

@Injectable()
export class CriacaoRemessaService {
  constructor(
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly debentureSerieRepositorio: DebentureSerieRepositorio,
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
  ) {}

  async solicitarRemessa(data: BodyCriacaoRemessaDto) {
    try {
      const debenture_serie =
        await this.debentureSerieRepositorio.encontrarSeriePorNumeroSerie(
          Number(data.numero_serie),
        );

      const debentureSerieInvestidor =
        await this.debentureSerieInvestidorRepositorio.encontrarPorIdDebentureSerie(
          debenture_serie.id,
        );
      const fundoInvestimento =
        await this.fundoInvestimentoRepositorio.encontrarPorId(
          debentureSerieInvestidor.id_fundo_investimento,
        );

      const operacoesCedente = await this.encontrarOperacoesCedente(
        fundoInvestimento.cpf_cnpj,
      );

      const criaRemessaParaCadaOperacao = await Promise.all(
        operacoesCedente.map(async (operacao) => {
          const body = this.montarBodySolicitarRemessa(
            {
              numero_emissao: data.numero_debenture,
              numero_serie: data.numero_serie,
              numero_remessa: String(operacao.codigoOperacao),
              data_operacao: operacao.dataOperacao,
            },
            operacao.ativosInvest,
          );
          try {
            const solicitarRemessa = await this.solicitarRemessaCreditSec(body);
            return {
              success: true,
              operacao: operacao.codigoOperacao,
              data: solicitarRemessa,
            };
          } catch (error) {
            return {
              success: false,
              operacao: operacao.codigoOperacao,
              error: error.message,
            };
          }
        }),
      );
      return criaRemessaParaCadaOperacao;
    } catch (error) {
      throw error;
    }
  }

  private async solicitarRemessaCreditSec(body: SolicitarRemessaType) {
    const req = await fetch(
      `${process.env.BASE_URL_CREDIT_SEC_SOLICITAR_REMESSA}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TOKEN_CREDIT_SEC_SOLICITAR_REMESSA}`,
        },
      },
    );

    if (!req.ok) {
      throw new HttpException(
        `Erro ao criar remessa: ${req.status} ${req.statusText}`,
        req.status,
      );
    }

    const res = await req.json();

    return res;
  }

  private async encontrarOperacoesCedente(
    identificador: string,
  ): Promise<OperacoesCedente[]> {
    const req = await fetch(
      `${process.env.BASE_URL_OPERACOES_INVEST}fluxo-operacional/v1/operacoes-invest?identificadorCedente=${identificador}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );

    if (!req.ok)
      throw new HttpException(
        `Erro ao encontrar operações do cedente: ${req.status} ${req.statusText}`,
        req.status,
      );

    const res = await req.json();
    return res;
  }
  private async encontrarCCBAtivos(codigoAtivo: string) {
    const req = await fetch(
      `${process.env.CCB_BASE_URL}/operacoes/${codigoAtivo}/assinatura-digital?modo=OPERACAO&codigosDocumento=20,21,33,35,39,46,50,54`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );
    if (!req.ok)
      throw new HttpException(
        `Erro ao encontrar CCBs da operação: ${req.status} ${req.statusText}`,
        req.status,
      );

    const res = await req.json();
    return res;
  }

  private montarBodySolicitarRemessa(
    {
      numero_remessa,
      numero_emissao,
      numero_serie,
      data_operacao,
    }: NumerosSolicitarRemessa,
    dadosAtivo: AtivosInvest[],
  ): SolicitarRemessaType {
    const ativos = dadosAtivo.map((ativo) => {
      return {
        numero: String(ativo.codigoAtivo),
        taxa_cessao: ativo.tir,
        tipo: ativo.tipoAtivo,
        sacado: {
          cnpj: ativo.sacado.identificador,
          razao_social: ativo.sacado.nome,
          nome_fantasia: null,
        },
        data_emissao: data_operacao,
        //pendente
        lastro: {
          url: 'https://drive.google.com/file/d/1RGaQcxpmaa5tGUHcyglWRj1iDnQ_unK5/view?usp=drive_link',
        },
        parcelas: ativo.recebiveis.map((parcelas) => {
          return {
            data_vencimento: parcelas.dataVencimento,
            valor_face: parcelas.valorFuturo,
            valor_operado: parcelas.valorPresente,
          };
        }),
      };
    });
    return {
      numero_remessa,
      numero_emissao,
      numero_serie,
      callback_url: 'https://schamberger.example/wes_rempel',
      titulos: ativos,
    };
  }
}
