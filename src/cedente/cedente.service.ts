import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from 'src/auth/constants';

@Injectable()
export class CedenteService {
  constructor(private configService: ConfigService) {}

  async buscarBancos() {
    const baseUrl = this.configService.get<string>(
      'BASE_URL_CADASTRO_CEDENTE_SIGMA',
    );
    const url = `${baseUrl?.split('/v1')[0]}/v1/bancos`;

    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': sigmaHeaders['X-API-KEY'],
    };
    const resposta = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao buscar bancos: ${resposta.statusText}`);
    }

    const dados = await resposta.json();

    return dados;
  }
}
