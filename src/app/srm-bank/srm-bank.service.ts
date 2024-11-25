import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import {
  RespostaCriarContaSrmBank,
  RespostaBuscarContaSrmBank,
  RegistrarContaNoCC,
} from './interface/interface';
import { sigmaHeaders } from 'src/app/autenticacao/constants';
import { ContaInvestidorRepositorio } from 'src/repositorios/contratos/contaInvestidorRespositorio';

@Injectable()
export class SrmBankService {
  constructor(
    private readonly contaInvestidorRepositorio: ContaInvestidorRepositorio,
  ) {}

  async criarContaInvestidor(dados: {
    identificador: string;
    id_cedente: string;
  }) {
    try {
      const criarConta = await this.CriarContaSRMBank(dados.identificador);
      const buscarConta = await this.buscarContaSrmBank(
        dados.identificador,
        criarConta.conta.slice(0, 9),
      );

      const objRegistrarContaCC: RegistrarContaNoCC = {
        id_fundo_investidor: Number(dados.id_cedente),
        identificador_favorecido: String(criarConta.id),
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
    } catch (error) {
      throw error;
    }
  }

  private async CriarContaSRMBank(
    identificador: string,
  ): Promise<RespostaCriarContaSrmBank> {
    const body = {
      documentoIdentificacao: identificador,
    };

    const req = await fetch(
      `${process.env.BASE_URL_SRM_BANK}gestao/contas/serie`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const response = await req.json();

    if (req.ok) return { sucesso: true, ...response };

    throw new HttpException(
      `Erro ao criar conta: ${response.motivo}`,
      req.status,
    );
  }
  private async buscarContaSrmBank(
    identificador: string,
    numeroConta: string,
  ): Promise<RespostaBuscarContaSrmBank> {
    const req = await fetch(
      `${process.env.BASE_URL_CADASTRO_CEDENTE_SIGMA}/${identificador}/contas-corrente`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );

    if (!req.ok)
      throw new HttpException(
        `Erro ao buscar conta: ${req.status} ${req.statusText}`,
        req.status,
      );

    const res = await req.json();

    const findConta = res.find(
      (ele: RespostaBuscarContaSrmBank) =>
        ele.dadosBancarios.contaCorrente == numeroConta,
    );

    if (!findConta) {
      return await this.buscarContaSrmBank(identificador, numeroConta);
    }
    return findConta;
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

  async buscarContaInvestidor(idFundoInvestidor: number) {
    try {
      const conta =
        await this.contaInvestidorRepositorio.buscarContaInvestidorPorIdentificadorFundo(
          idFundoInvestidor,
        );
      return conta || { mensagem: 'Conta não encontrada' };
    } catch (error) {
      throw new HttpException(
        `Erro ao buscar conta investidor: ${error.message}`,
        500,
      );
    }
  }
}
