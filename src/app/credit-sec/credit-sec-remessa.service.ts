import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { sigmaHeaders } from 'src/app/auth/constants';
import { DebentureSerieInvestidorRepositorio } from 'src/repositorios/contratos/debentureSerieInvestidorRepositorio';
import { DebentureSerieRepositorio } from 'src/repositorios/contratos/debenturesSerieRepositorio';
import { FundoInvestimentoRepositorio } from 'src/repositorios/contratos/fundoInvestimentoRepositorio';
import {
  BodyCriacaoRemessaDto,
  BodyRetornoRemessaDto,
} from './dto/remessa-callback.dto';
import {
  BodyCriarRegistroOperacao,
  NumerosSolicitarRemessa,
  OperacoesCedente,
  SolicitarRemessaType,
} from './interface/interface';
import { AtivosInvest } from 'src/@types/entities/ativoInvestido';
import { Cron } from '@nestjs/schedule';
import { OperacaoDebentureRepositorio } from 'src/repositorios/contratos/operacaoDebentureRepositorio';
import { CriarOperacaoDebenture } from 'src/@types/entities/operacaoDebenture';
import { DebentureRepositorio } from 'src/repositorios/contratos/debentureRepositorio';

@Injectable()
export class CreditSecRemessaService {
  constructor(
    private readonly fundoInvestimentoRepositorio: FundoInvestimentoRepositorio,
    private readonly debentureRepositorio: DebentureRepositorio,
    private readonly debentureSerieRepositorio: DebentureSerieRepositorio,
    private readonly debentureSerieInvestidorRepositorio: DebentureSerieInvestidorRepositorio,
    private readonly operacaoDebentureRepositorio: OperacaoDebentureRepositorio,
  ) {}
  @Cron('0 0 10 * * 1-5')
  async buscarStatusSolicitacaoRemessa() {
    try {
      const remessasPendentes =
        await this.operacaoDebentureRepositorio.buscarOperacoesPeloStatusCreditSec(
          'PENDING',
        );

      await Promise.all(
        remessasPendentes.map(async (remessa) => {
          const debentureSerieInvestidor =
            await this.debentureSerieInvestidorRepositorio.encontrarPorId(
              remessa.id_debenture_serie_investidor,
            );
          const debentureSerie =
            await this.debentureSerieRepositorio.encontrarPorId(
              debentureSerieInvestidor.id_debenture_serie,
            );
          const debenture = await this.debentureRepositorio.encontrarPorId(
            debentureSerie.id_debenture,
          );

          const buscarStatusRemessa = await this.buscarStatusRemessa({
            numero_emissao: debenture.numero_debenture,
            numero_remessa: remessa.codigo_operacao,
            numero_serie: debentureSerie.numero_serie,
          });

          await this.registrarRetornoCreditSec(buscarStatusRemessa);
          return;
        }),
      );
    } catch (error) {
      throw error;
    }
  }
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

      const operacaoCedente = await this.encontrarOperacoesCedenteSigma(
        String(data.codigo_operacao),
      );

      const body = this.montarBodySolicitarRemessa(
        {
          numero_emissao: data.numero_debenture,
          numero_serie: data.numero_serie,
          numero_remessa: String(data.codigo_operacao),
          data_operacao: operacaoCedente.dataOperacao,
        },
        operacaoCedente.ativosInvest,
      );

      const solicitarRemessa = await this.solicitarRemessaCreditSec(body);

      //TO-DO: CHAMAR SERVIÇO DE BAIXA DE VALOR INVESTIDO. QUE SERÁ CRIADO PELO LORENZO

      const dataCriarOperacaoDebentureCreditConnect = {
        codigo_operacao: String(data.codigo_operacao),
        status_retorno_creditsec: 'PENDING',
        id_debenture_serie_investidor: debentureSerieInvestidor.id,
        data_inclusao: new Date(),
      };

      await this.criarOperacaoDebentureCreditConnect(
        dataCriarOperacaoDebentureCreditConnect,
      );

      const bodyCriarOperacaoSigma: BodyCriarRegistroOperacao = {
        cedenteIdentificador: '49947676000186',
        codigoControleParceiroValor: operacaoCedente.codigoControleParceiro,
        investidorIdentificador: fundoInvestimento.cpf_cnpj,
        produtoSigla: 'DEBINVEST',
      };
      await this.criarRegistroDeOperacaoSigma(
        String(data.codigo_operacao),
        bodyCriarOperacaoSigma,
      );

      return {
        sucesso: true,
        operacao: operacaoCedente.codigoOperacao,
        data: solicitarRemessa,
      };
    } catch (error) {
      throw error;
    }
  }
  async registrarRetornoCreditSec(data: BodyRetornoRemessaDto) {
    try {
      const encontrarOperacoesdebenture =
        await this.operacaoDebentureRepositorio.buscarOperacoesPeloCodigoOperacao(
          data.numero_remessa,
        );
      const operacaoPendente = encontrarOperacoesdebenture.find(
        (operacao) => operacao.status_retorno_creditsec === 'PENDING',
      );
      if (data.status === 'SUCCESS') {
        //CHAMAR OUTRO SERVIÇO QUE O LORENZO FEZ, NA RN17, SOBRE A CONTA DO CEDENTE
        await this.destravarOperacaoDebentureSigma(data.numero_remessa);

        const bodyAtualizarOperacao = {
          status_retorno_creditsec: data.status,
        };
        await this.operacaoDebentureRepositorio.atualizar(
          bodyAtualizarOperacao,
          operacaoPendente.id,
        );
        return;
      }

      if (data.status === 'FAILURE') {
        //CHAMAR OUTRO SERVIÇO QUE O LORENZO FEZ, NA RN25, SOBRE O ESTORNO AO CEDENTE

        const bodyAtualizarOperacao = {
          status_retorno_creditsec: data.status,
          data_exclusao: new Date(),
        };
        await this.operacaoDebentureRepositorio.atualizar(
          bodyAtualizarOperacao,
          operacaoPendente.id,
        );
        await this.excluirOperacaoDebentureSigma(data.numero_remessa);
        return;
      }
      return;
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

  private async buscarStatusRemessa({
    numero_emissao,
    numero_remessa,
    numero_serie,
  }: Omit<NumerosSolicitarRemessa, 'data_operacao'>) {
    const req = await fetch(
      `${process.env.BASE_URL_CREDIT_SEC_SOLICITAR_REMESSA}?numero_remessa=${numero_remessa}&numero_serie=${numero_serie}&numero_emissao=${numero_emissao}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.TOKEN_CREDIT_SEC_SOLICITAR_REMESSA}`,
        },
      },
    );
    if (!req.ok)
      throw new HttpException(
        `Erro ao buscar remessa: ${req.status} ${req.statusText}`,
        req.status,
      );

    const res = await req.json();

    return res;
  }

  private async encontrarOperacoesCedenteSigma(
    codigoOperacao: string,
  ): Promise<OperacoesCedente> {
    const req = await fetch(
      `${process.env.BASE_URL_OPERACOES_INVEST}fluxo-operacional/v1/operacoes-invest/${codigoOperacao}`,
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

  private async criarRegistroDeOperacaoSigma(
    codigoOperacao: string,
    body: BodyCriarRegistroOperacao,
  ) {
    const req = await fetch(
      `${process.env.BASE_URL_CRIAR_REGISTRO_OPERACAO}/v1/operacoes-invest/${codigoOperacao}/analisar`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
        body: JSON.stringify(body),
      },
    );

    if (!req.ok)
      throw new HttpException(
        `Erro ao criar registro de operação no sigma: ${req.status} ${req.statusText}`,
        req.status,
      );

    const res = { sucesso: true, codigoOperacao };
    return res;
  }

  private async destravarOperacaoDebentureSigma(codigoOperacao: string) {
    const req = await fetch(
      `${process.env.BASE_URL_ASSINATURA_DIGITAL}/operacoes/${codigoOperacao}/destravar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );
    if (!req.ok)
      throw new HttpException(
        `Erro ao destravar operação no sigma: ${req.status} ${req.statusText}`,
        req.status,
      );

    const res = { sucesso: true, codigoOperacao };
    return res;
  }

  private async excluirOperacaoDebentureSigma(codigoOperacao: string) {
    const body = {
      complementoStatusOperacao:
        'A emissão da Remessa foi Recusada pela CreditSec',
    };
    const req = await fetch(
      `${process.env.BASE_URL_OPERACOES_INVEST}fluxo-operacional/v1/operacoes-invest/${codigoOperacao}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
        body: JSON.stringify(body),
      },
    );
    if (!req.ok)
      throw new HttpException(
        `Erro ao excluir operação no sigma: ${req.status} ${req.statusText}`,
        req.status,
      );

    const res = { sucesso: true, codigoOperacao };
    return res;
  }

  private async criarOperacaoDebentureCreditConnect(
    data: CriarOperacaoDebenture,
  ) {
    const criarOperacaoDebenture =
      await this.operacaoDebentureRepositorio.criar(data);
    if (!criarOperacaoDebenture)
      throw new InternalServerErrorException(
        `Erro ao criar a operação debenture no Credit Connect`,
      );
    return criarOperacaoDebenture;
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
      callback_url: `${process.env.BASE_URL}api/credit-sec/solicitar-remessa/retorno/criacao-remessa`,
      titulos: ativos,
    };
  }
}
