import { Injectable } from '@nestjs/common';
import { AtivosInvest, Recebiveis } from 'src/@types/entities/ativoInvestido';
import { Cedente, OperacaoInvest } from 'src/@types/entities/operacao';
import { ErroAplicacao, ErroServidorInterno } from 'src/helpers/erroAplicacao';
import { converterDataParaISO } from 'src/utils/funcoes/data';
import { formatarBrlParaNumero } from 'src/utils/funcoes/mascaras';
import {
  identificadorCedente,
  OrganizaCarteirasParamsDto,
} from './dto/organizaCarteiras.dto';

type AtivoType = Pick<
  AtivosInvest,
  'valorPresente' | 'valorFuturo' | 'spread' | 'tir'
> & {
  cedente: Cedente;
  recebiveis: Omit<Recebiveis, 'codigoRecebivel'>[];
};

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
      const url = `${process.env.BASE_URL_OPERACAO_INVEST}?identificadorCedente=${identificadorInvestidor}`;

      const req = await fetch(url, {
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

  async organizarCarteiras(
    queryParam: OrganizaCarteirasParamsDto & identificadorCedente,
  ) {
    try {
      const buscaOperacoes = await this.buscarTodasOperacoes(
        queryParam.identificadorInvestidor,
      );
      const operacoesValidas = buscaOperacoes.filter(
        (op) => op.statusOperacao !== 'EM_NEGOCIACAO',
      );

      const carteirasUnicas = [
        ...new Set(
          operacoesValidas.map((op: any) => op.codigoControleParceiro),
        ),
      ];
      const datasUnicas = [
        ...new Set(operacoesValidas.map((op: any) => op.dataOperacao)),
      ];
      const qtdAtivosUnicos = [
        ...new Set(operacoesValidas.map((op: any) => op.ativosInvest.length)),
      ];
      const totalInvestimentoUnicos = [
        ...new Set(operacoesValidas.map((op: any) => op.valorBruto)),
      ];
      const statusUnicos = [
        ...new Set(operacoesValidas.map((op: any) => op.statusOperacao)),
      ];

      const operacoesFiltradas = operacoesValidas.filter((operacao) => {
        if (
          queryParam.fundoInvestidor &&
          queryParam.fundoInvestidor !== operacao.codigoControleParceiro
        )
          return false;

        if (
          queryParam.totalInvestimento &&
          operacao.valorBruto !==
            formatarBrlParaNumero(String(operacao.valorBruto))
        )
          return false;

        if (
          queryParam.data &&
          operacao.dataOperacao !== converterDataParaISO(operacao.dataOperacao)
        )
          return false;

        if (
          queryParam.qtativos &&
          operacao.ativosInvest.length !== parseInt(queryParam.qtativos)
        )
          return false;

        if (
          queryParam.status &&
          operacao.statusOperacao !==
            this.reverseMapStatus(operacao.statusOperacao)
        )
          return false;

        return true;
      });

      if (operacoesFiltradas.length === 0)
        throw new ErroServidorInterno({
          mensagem: 'Nenhuma operação encontrada com status adequado',
          acao: 'operacaoInvestService.organizarCarteiras',
          informacaoAdicional: { queryParam },
        });

      const addCalculos = operacoesFiltradas.map((operacao) => {
        const ativosModificado = operacao.ativosInvest.map((ativo) => {
          const ativoComCalculos = {
            valorLiquidado: this.calculaValorLiquido(ativo),
            valorAVencer: this.calculaDataDeVencimento(ativo),
            valorVencido: this.calculaValorVencido(ativo),
            qtdParcelasAVencer: this.calculaParcelasAVencer(ativo),
            qtdParcelasLiquidadas: this.calculaParcelasLiquidadas(ativo),
            dataUltimoPagamento: this.calculaUltimoPagamento(ativo),
            taxaRendimento: this.calculaTaxaDeRendimento(ativo),
            ...ativo,
          };
          return ativoComCalculos;
        });
        operacao.ativosInvest = ativosModificado;
        return operacao;
      });

      return {
        carteiras: addCalculos,
        uniqueFilters: {
          uniqueCarteiras: carteirasUnicas,
          uniqueDatas: datasUnicas,
          uniqueQtAtivos: qtdAtivosUnicos,
          uniqueTotalInvestimentos: totalInvestimentoUnicos,
          uniqueStatus: statusUnicos,
        },
      };
    } catch (error) {
      if (error instanceof ErroAplicacao) throw error;
      throw new ErroServidorInterno({
        mensagem: 'Nenhuma operação encontrada com status adequado',
        acao: 'operacaoInvestService.organizarCarteiras.catch',
        informacaoAdicional: { error },
      });
    }
  }

  private reverseMapStatus(status: string) {
    const reverseStatusMap: Record<string, string> = {
      Concluído: 'ATIVOS_INVESTIDOR',
      'Em Estruturação': 'EM_ESTRUTURACAO',
      'Em Formalização': 'EM_FORMALIZACAO',
      'Em Conciliação': 'EM_CONCILIACAO',
    };

    return reverseStatusMap[status] || status;
  }

  private calculaValorLiquido(obj: AtivoType) {
    const today = new Date();
    const liquidatedInstallments = obj.recebiveis.filter((ele) => {
      const dataDue = new Date(ele.dataVencimento);
      return dataDue < today && ele.dataLiquidacao;
    });

    const liquidatedAmount = liquidatedInstallments.reduce((soma, obj) => {
      return soma + obj.valorFuturo;
    }, 0);

    return liquidatedAmount;
  }

  private calculaDataDeVencimento(obj: AtivoType) {
    const today = new Date();
    const toDueInstallments = obj.recebiveis.filter((ele) => {
      const dataDue = new Date(ele.dataVencimento);
      return dataDue > today && !ele.dataLiquidacao;
    });
    const toDueAmount = toDueInstallments.reduce((soma, obj) => {
      return soma + obj.valorFuturo;
    }, 0);

    return toDueAmount;
  }

  private calculaValorVencido(obj: AtivoType) {
    const today = new Date();
    const dueInstallments = obj.recebiveis.filter((ele) => {
      const dataDue = new Date(ele.dataVencimento);
      return dataDue < today && !ele.dataLiquidacao;
    });

    const pastAmount = dueInstallments.reduce((soma, obj) => {
      return soma + obj.valorFuturo;
    }, 0);

    return pastAmount;
  }

  private calculaParcelasAVencer(obj: AtivoType) {
    const today = new Date();
    const toDue = obj.recebiveis.filter((ele) => {
      const dataDue = new Date(ele.dataVencimento);
      return dataDue > today && !ele.dataLiquidacao;
    });

    return toDue.length;
  }

  private calculaParcelasLiquidadas(obj: AtivoType) {
    const findInstallmentSettled = obj.recebiveis.filter(
      (ele) => ele.dataLiquidacao,
    );
    return findInstallmentSettled.length;
  }

  private calculaUltimoPagamento(obj: AtivoType) {
    const lastInstallment = obj.recebiveis.reduce((latestDate, obj) => {
      const currentDate = new Date(obj.dataVencimento);

      return latestDate > currentDate ? latestDate : currentDate;
    }, new Date(0));

    return lastInstallment;
  }

  private calculaTaxaDeRendimento(obj: AtivoType) {
    const tirToReceiveValue = obj.valorFuturo - obj.valorPresente;
    const liquidatedValue = this.calculaValorLiquido(obj);
    const percent = (liquidatedValue / tirToReceiveValue) * 100;
    return percent;
  }
}
