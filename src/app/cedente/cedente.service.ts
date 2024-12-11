import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from '../autenticacao/constants';
import { ErroServidorInterno } from 'src/helpers/erroAplicacao';

@Injectable()
export class CedenteService {
  constructor(private configService: ConfigService) {}

  async buscarBancos() {
    const logAcao = 'cedenteBuscarBancos';
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
      throw new ErroServidorInterno({
        acao: logAcao,
        mensagem: `Erro ao buscar bancos: ${resposta.statusText}`,
      });
    }

    const dados = await resposta.json();

    return dados;
  }
}
