import { Injectable } from '@nestjs/common';
import {
  RespostaCriarContaSrmBank,
  RespostaBuscarContaSrmBank,
  RegistrarContaNoCC,
} from './interface/interface';
import { sigmaHeaders } from 'src/app/autenticacao/constants';
import { ContaInvestidorRepositorio } from 'src/repositorios/contratos/contaInvestidorRespositorio';
import { ConfigService } from '@nestjs/config';
import {
  ErroAplicacao,
  ErroRequisicaoInvalida,
  ErroServidorInterno,
} from 'src/helpers/erroAplicacao';
import { tratarErroRequisicao } from 'src/utils/funcoes/erros';

@Injectable()
export class SrmBankService {
  constructor(
    private readonly contaInvestidorRepositorio: ContaInvestidorRepositorio,
    private readonly configService: ConfigService,
  ) {}

  async criarContaInvestidor(idFundoInvestidor: number) {
    const identificador = this.configService.get(
      'IDENTIFICADOR_CREDITSEC',
    ) as string;
    try {
      const criarConta = await this.CriarContaSRMBank(identificador);
      const buscarConta = await this.buscarContaSrmBank(
        identificador,
        criarConta.conta,
      );

      const objRegistrarContaCC: RegistrarContaNoCC = {
        id_fundo_investidor: idFundoInvestidor,
        identificador_favorecido: identificador,
        agencia: criarConta.agencia,
        agencia_digito: '0',
        codigo_banco: '533',
        codigo_conta: String(buscarConta.dadosBancarios.codigoContaCorrente),
        conta: criarConta.conta.slice(0, 9),
        conta_digito: criarConta.conta.slice(-1),
        nome_favorecido: criarConta.nomeTitular,
      };
      const contaCreditConnect =
        await this.registrarContaNoCreditConnect(objRegistrarContaCC);

      return {
        mensagem: 'Conta Criada com sucesso ',
        conta_investidor: contaCreditConnect,
      };
    } catch (erro) {
      if (erro instanceof ErroAplicacao) throw erro;
      throw new ErroServidorInterno({
        acao: 'srmBankService.criarContaInvestidor',
        mensagem: 'Não foi possível criar conta',
        detalhes: { erro },
      });
    }
  }

  private async CriarContaSRMBank(
    identificador: string,
  ): Promise<RespostaCriarContaSrmBank> {
    const body = {
      documentoIdentificacao: identificador,
    };

    const req = await fetch(
      `${process.env.BASE_URL_SRM_BANK}/gestao/contas/serie`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!req.ok) {
      await tratarErroRequisicao({
        acao: 'srmBankService.criarContaSrmBank',
        mensagem: `Erro ao criar conta. ${req.statusText}`,
        req,
        detalhes: {
          status: req.status,
          texto: req.statusText,
          url: req.url,
        },
      });
    }

    const response = await req.json();
    return { sucesso: true, ...response };
  }
  private async buscarContaSrmBank(
    identificador: string,
    numeroConta: string,
  ): Promise<RespostaBuscarContaSrmBank> {
    const req = await fetch(
      `${process.env.BASE_URL_CADASTRO_CEDENTE_SIGMA}/${identificador}/contas-corrente?numeroContaCorrente=${numeroConta}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );

    if (!req.ok)
      await tratarErroRequisicao({
        acao: 'srmBankService.buscarContaSrmBank',
        mensagem: `Erro ao buscar conta: ${req.status} ${req.statusText}`,
        req,
        detalhes: {
          status: req.status,
          texto: req.statusText,
          url: req.url,
        },
      });

    const res = await req.json();

    if (res.length === 0) {
      return await this.buscarContaSrmBank(identificador, numeroConta);
    }
    return res[0];
  }
  async buscarContaSrmBankAtivaPorCnpj(identificador: string) {
    const logAcao = 'srmBankService.buscarContaSrmBankAtivaPorCnpj';
    const req = await fetch(
      `${process.env.BASE_URL_CADASTRO_CEDENTE_SIGMA}/${identificador}/contas-corrente?ativo=true`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );
    if (!req.ok)
      await tratarErroRequisicao({
        acao: logAcao,
        mensagem: `Erro ao buscar conta: ${req.status} ${req.statusText}`,
        req,
        detalhes: {
          identificador,
          status: req.status,
          texto: req.statusText,
          url: req.url,
        },
      });

    const data = await req.json();

    if (!data.length)
      throw new ErroRequisicaoInvalida({
        acao: logAcao,
        mensagem: 'Não foi encontrada Nenhuma conta ativa',
        detalhes: {
          identificador,
        },
      });
    const firstAccount = data[0].dadosBancarios;

    if (!firstAccount)
      throw new ErroServidorInterno({
        acao: logAcao,
        mensagem: 'Houve um erro desconhecido',
        detalhes: {
          identificador,
        },
      });

    return firstAccount;
  }

  private async registrarContaNoCreditConnect(data: RegistrarContaNoCC) {
    return await this.contaInvestidorRepositorio.criarContaInvestidor({
      agencia: data.agencia,
      agencia_digito: data.agencia_digito,
      codigo_conta: data.codigo_conta,
      conta: data.conta,
      conta_digito: data.conta_digito,
      codigo_banco: data.codigo_banco,
      identificador_favorecido: data.identificador_favorecido,
      id_fundo_investidor: data.id_fundo_investidor,
      nome_favorecido: data.nome_favorecido,
    });
  }

  async buscarSaldoContaInvestidor(idContaInvestidor: string) {
    const contInvestidor =
      await this.contaInvestidorRepositorio.buscarContaPorId(
        Number(idContaInvestidor),
      );
    const { conta, conta_digito } = contInvestidor;
    const numeroConta = conta + conta_digito;
    try {
      const url = `${process.env.BASE_URL_SRM_BANK}/consultas/saldo?numeroConta=${numeroConta}`;

      const req = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const resposta = await req.json();
      if (!req.ok) {
        throw new ErroServidorInterno({
          mensagem: 'Ocorreu um erro ao buscar o saldo',
          acao: 'srmBankService.buscarSaldoContaInvestidor',
          detalhes: {
            idContaInvestidor,
            resposta,
            req,
            numeroConta,
          },
        });
      }

      return { saldoEmConta: resposta.saldoEmConta };
    } catch (erro) {
      if (erro instanceof ErroAplicacao) throw erro;
      throw new ErroServidorInterno({
        acao: 'srmBankService.buscarSaldoContaInvestidor.catch',
        mensagem: 'Ocorreu um erro ao buscar o saldo',
        detalhes: {
          idContaInvestidor,
          erro,
          mensagemErro: erro.message,
        },
      });
    }
  }
}
