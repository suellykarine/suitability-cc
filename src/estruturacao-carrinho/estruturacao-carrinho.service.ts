import { Injectable, HttpException } from '@nestjs/common';
import { CreateEstruturacaoCarrinhoDto } from './dto/create-estruturacao-carrinho.dto';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from 'src/auth/constants';
import { FormalizarCarteiraDto } from './dto/formalizar-carteira.dto';
import { ExcluirCarteiraDto } from './dto/excluir-carteira.dto';
import { IntroduzirAtivoCarteiraDto } from './dto/introduzir-ativo-carteira.dto';

@Injectable()
export class EstruturacaoCarrinhoService {
  private baseUrlCart: string;
  constructor(private configService: ConfigService) {
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
}
