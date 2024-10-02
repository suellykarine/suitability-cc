import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { IBuscarCedente, IRespostaSrmBank } from './interface/interface';
import { sigmaHeaders } from 'src/auth/constants';

@Injectable()
export class SrmBankService {
  constructor(private prisma: PrismaService) {}

  async criarContaInvestidor(dados: { identificador: string }) {
    try {
      const criarConta = await this.CriarContaSRMBank(dados.identificador);

      if (criarConta.sucesso) {
        return {
          mensagem: 'Conta Criada com sucesso ',
          conta_investidor: criarConta,
        };
      }
    } catch (error) {
      throw new HttpException(
        { status: error.status, message: error.message },
        error.status,
      );
    }
  }

  private async CriarContaSRMBank(
    identificador: string,
  ): Promise<IRespostaSrmBank> {
    const body = {
      documentoIdentificacao: identificador,
    };

    const criarConta = await fetch(
      `${process.env.BASE_URL_SRM_BANK}gestao/contas/serie`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const response = await criarConta.json();

    if (criarConta.ok) {
      return { sucesso: true, ...response };
    } else {
      throw new HttpException(
        {
          status: response.status || 400,
          message: response.message || 'Erro ao criar conta',
        },
        response.status || 400,
      );
    }
  }

  private async BuscarCedenteSigma(
    identificador: string,
  ): Promise<IBuscarCedente> {
    const buscarCedente = await fetch(
      `${process.env.BASE_URL_CADASTRO_CEDENTE_SIGMA}/${identificador}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
      },
    );
    const response = await buscarCedente.json();

    return response;
  }

  private async BuscarCedenteCreditConnect(identificador: string) {
    const fund = await this.prisma.fundo_investimento.findUnique({
      where: { cpf_cnpj: identificador },
    });
    return fund;
  }
}
