import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from '../autenticacao/constants';
import { atualizarProcuradorDto } from './dto/atualziarProcuradorInvestidorDto';
import { atualizarRepresentanteLegalDto } from './dto/representanteLegalInvestidorDto';

@Injectable()
export class CadastroPessoaJuridicaService {
  private readonly urlBase: string;

  constructor(private readonly configService: ConfigService) {
    this.urlBase = this.configService.get<string>(
      'BASE_URL_CADASTRO_PESSOA-JURIDICA_SIGMA',
    );
  }

  async atualizarRepresentanteLegal(
    identificadorCedente: string,
    identificadorRepresentanteLegal: string,
    representanteLegalInvestidor: atualizarRepresentanteLegalDto,
  ): Promise<any> {
    const url = `${this.urlBase}/cadastro-cedente/v1/cedentes-pessoa-juridica/${identificadorCedente}/representantes-legais-investidores/${identificadorRepresentanteLegal}`;
    return this.realizarRequisicao(url, 'PUT', representanteLegalInvestidor);
  }

  async atualizarProcuradorInvestidor(
    identificadorCedente: string,
    identificadorProcurador: string,
    procuradorInvestidor: atualizarProcuradorDto,
  ): Promise<any> {
    const url = `${this.urlBase}/cadastro-cedente/v1/cedentes-pessoa-juridica/${identificadorCedente}/procuradores-investidores/${identificadorProcurador}`;
    return this.realizarRequisicao(url, 'PUT', procuradorInvestidor);
  }

  private async realizarRequisicao(
    url: string,
    metodo: 'PUT',
    corpo: atualizarRepresentanteLegalDto | atualizarProcuradorDto,
  ): Promise<any> {
    const resposta = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': sigmaHeaders['X-API-KEY'],
      },
      body: JSON.stringify(corpo),
    });

    const textoResposta = await resposta.text();

    if (!resposta.ok) {
      console.error('Erro na API:', textoResposta);
      throw new HttpException(
        `Erro ao consumir a API externa: ${textoResposta}`,
        resposta.status,
      );
    }

    return textoResposta ? JSON.parse(textoResposta) : null;
  }
}
