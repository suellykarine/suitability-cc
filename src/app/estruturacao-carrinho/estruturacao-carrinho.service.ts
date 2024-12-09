import { Injectable, HttpException, BadRequestException } from '@nestjs/common';
import { CreateEstruturacaoCarrinhoDto } from './dto/create-estruturacao-carrinho.dto';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from '../autenticacao/constants';
import { FormalizarCarteiraDto } from './dto/formalizar-carteira.dto';
import { ExcluirCarteiraDto } from './dto/excluir-carteira.dto';
import { IntroduzirAtivoCarteiraDto } from './dto/introduzir-ativo-carteira.dto';
import {
  EstruturarInvestimentodiretoDto,
  EstruturarInvestimentoDiretoResponseDto,
} from './dto/estruturar-investimento-direto.dto';
import { SrmBankService } from '../srm-bank/srm-bank.service';
import { controleDeCadastroContaCedenteOperaçõesDiretasProps } from './types/estruturacaoCarrinho';

@Injectable()
export class EstruturacaoCarrinhoService {
  private baseUrlCart: string;
  constructor(
    private configService: ConfigService,
    private srmBankService: SrmBankService,
  ) {
    this.baseUrlCart = this.configService.get<string>('BASE_URL_CART');
  }
  async criarCarteira(
    createEstruturacaoCarrinhoDto: CreateEstruturacaoCarrinhoDto,
  ) {
    const corpoRequisicao = {
      cedenteIdentificador: createEstruturacaoCarrinhoDto.cedenteIdentificador,
      codigoControleParceiro:
        createEstruturacaoCarrinhoDto.codigoControleParceiro,
      produtoSigla: this.configService.get<string>('PRODUCT_SIGLA'),
      ativosInvest: [
        {
          operacaoId: createEstruturacaoCarrinhoDto.operacaoId,
        },
      ],
    };

    const resposta = await fetch(`${this.baseUrlCart}operacoes-invest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': sigmaHeaders['X-API-KEY'],
      },
      body: JSON.stringify(corpoRequisicao),
    });

    if (!resposta.ok) {
      const dadosErro = await resposta.json();
      throw new HttpException(dadosErro, resposta.status);
    }

    const dados = await resposta.json();
    return dados;
  }

  async formalizarCarteira(
    formalizarCarteiraDto: FormalizarCarteiraDto,
    carteiraId: string,
  ) {
    const corpoRequisicao = {
      tipoEstruturacao: formalizarCarteiraDto.tipoEstruturacao,
    };

    const resposta = await fetch(
      `${this.baseUrlCart}operacoes-invest/${carteiraId}/formalizar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
        body: JSON.stringify(corpoRequisicao),
      },
    );

    if (!resposta.ok) {
      const dadosErro = await resposta.json();
      throw new HttpException(dadosErro, resposta.status);
    }

    return true;
  }

  async excluirCarteira(
    excluirCarteiraDto: ExcluirCarteiraDto,
    carteiraId: string,
  ): Promise<void> {
    const resposta = await fetch(
      `${this.baseUrlCart}operacoes-invest/${carteiraId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
        body: JSON.stringify({
          complementoStatusOperacao: excluirCarteiraDto.mensagem,
        }),
      },
    );

    if (!resposta.ok) {
      const dadosErro = await resposta.json();
      throw new HttpException(dadosErro, resposta.status);
    }
  }

  async introduzirAtivoCarteira(
    carteiraId: string,
    introduzirAtivoCarteiraDto: IntroduzirAtivoCarteiraDto,
  ) {
    const corpoRequisicao = {
      operacaoId: introduzirAtivoCarteiraDto.ativoId,
    };

    const resposta = await fetch(
      `${this.baseUrlCart}operacoes-invest/${carteiraId}/ativos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
        body: JSON.stringify(corpoRequisicao),
      },
    );

    if (!resposta.ok) {
      const dadosErro = await resposta.json();
      throw new HttpException(dadosErro, resposta.status);
    }
    const dados = await resposta.json();
    return dados;
  }

  async removerAtivoCarteira(
    carteiraId: string,
    ativoId: string,
  ): Promise<void> {
    const resposta = await fetch(
      `${this.baseUrlCart}operacoes-invest/${carteiraId}/ativos/${ativoId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );
    if (!resposta.ok) {
      const dadosErro = await resposta.json();
      throw new HttpException(dadosErro, resposta.status);
    }
  }

  async estruturarInvestimentoDireto({
    codigoOperacao,
    identificador,
  }: EstruturarInvestimentodiretoDto): Promise<EstruturarInvestimentoDiretoResponseDto> {
    const buscarContaAtiva =
      await this.srmBankService.buscarContaSrmBankAtivaPorCnpj(identificador);
    if (!buscarContaAtiva)
      throw new BadRequestException(
        'Não encontramos nenhuma conta ativa para o cedente',
      );

    const codigoContaCedente = buscarContaAtiva.codigoContaCorrente;
    const controleOperacao =
      await this.cadastrarControleDeCadastroContaCedenteOperacaoDireta({
        codigoContaCedente,
        codigoOperacao,
      });

    if (!controleOperacao)
      throw new BadRequestException(
        'Não foi possível registrar  o Controle de Cadastro da Conta do Cedente para Operações Financeiras',
      );

    const tipoDireto = 'COMPRA_DIRETA_DIREITO_CREDITO_TED';
    const formalizarInvestimento = await this.formalizarCarteira(
      { tipoEstruturacao: tipoDireto },
      `${codigoOperacao}`,
    );

    if (!formalizarInvestimento) {
      const deletarControle =
        await this.deletarControleDeCadastroContaCedenteOperacaoDireta(
          codigoOperacao,
        );

      if (!deletarControle)
        throw new BadRequestException('Não foi possivel deletar o controle');

      throw new BadRequestException(
        'Não foi possível iniciar a formalização da operação',
      );
    }

    return {
      mensagem: 'Compra formalizada com sucesso',
      data: {
        operacao: codigoOperacao,
        controle: controleOperacao,
      },
    };
  }

  private async cadastrarControleDeCadastroContaCedenteOperacaoDireta({
    codigoContaCedente,
    codigoOperacao,
  }: controleDeCadastroContaCedenteOperaçõesDiretasProps) {
    const body = {
      codigoContaCedente,
    };

    const req = await fetch(
      `${process.env.BASE_URL_PAGAMENTO}/pagamentos-operacao/${codigoOperacao}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );
    if (!req) {
      throw new BadRequestException(
        'Houve um erro ao cadastrar o metodo de controle da operacao',
      );
    }
    return await req.json();
  }
  private async deletarControleDeCadastroContaCedenteOperacaoDireta(
    codigoOperacao: number,
  ) {
    const req = await fetch(
      `${process.env.BASE_URL_PAGAMENTO}/pagamentos-operacao/${codigoOperacao}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );
    if (!req) {
      throw new BadRequestException(
        'Houve um erro ao excluir o metodo de operacao de pagamento',
      );
    }
    return {
      mensagem: 'Deletado com sucesso',
    };
  }
}
