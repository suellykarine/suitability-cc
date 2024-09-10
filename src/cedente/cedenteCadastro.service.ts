import { HttpException, Injectable } from '@nestjs/common';
import { CreateCedenteDto } from './dto/create-cedente.dto';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from 'src/auth/constants';

@Injectable()
export class CadastroCedenteService {
  constructor(private configService: ConfigService) {}

  async cadastrarCedente(createCedenteDto: CreateCedenteDto) {
    const urlBase = this.configService.get<string>(
      'BASE_URL_CADASTRO_CEDENTE_SIGMA',
    );

    const cabecalhos = {
      'Content-Type': 'application/json',
      'X-API-KEY': sigmaHeaders['X-API-KEY'],
    };

    const identificadorGerente = this.configService.get<string>(
      'IDENTIFICADOR_GERENTE',
    );

    const opcoes = {
      method: 'POST',
      headers: cabecalhos,
      body: JSON.stringify({
        ...createCedenteDto,
        identificadorGerente,
      }),
    };

    const resposta = await fetch(urlBase, opcoes);

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new HttpException(dados.message, dados.statusCode);
    }

    return dados;
  }
}
