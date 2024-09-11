import { HttpException, Injectable } from '@nestjs/common';
import { CreateCedenteDto } from './dto/create-cedente.dto';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from 'src/auth/constants';
import { CreateContaCorrenteDto } from './dto/create-conta-corrente.dto';
import { CreateContatoDto } from './dto/create-contato.dto';
import { CreateProcuradorInvestidorDto } from './dto/create-procurador-investidor.dto';
import { CreateRepresentanteLegalDto } from './dto/create-representante-legal.dto';

@Injectable()
export class CadastroCedenteService {
  private readonly urlBase: string;

  constructor(private configService: ConfigService) {
    this.urlBase = this.configService.get<string>(
      'BASE_URL_CADASTRO_CEDENTE_SIGMA',
    );
  }
  async cadastrarCedente(createCedenteDto: CreateCedenteDto) {
    const identificadorGerente = this.configService.get<string>(
      'IDENTIFICADOR_GERENTE',
    );
    const url = this.urlBase;

    return this.enviarRequisicao(url, createCedenteDto, identificadorGerente);
  }

  async cadastrarContaCorrente(
    cnpj: string,
    createContaCorrenteDto: CreateContaCorrenteDto,
  ) {
    const url = `${this.urlBase}/${cnpj}/contas-corrente`;

    return this.enviarRequisicao(url, createContaCorrenteDto);
  }

  async cadastrarContato(cnpj: string, createContatoDto: CreateContatoDto) {
    const url = `${this.urlBase}/${cnpj}/contatos`;

    return this.enviarRequisicao(url, createContatoDto);
  }

  async cadastrarProcuradorInvestidor(
    cnpj: string,
    createProcuradorInvestidorDto: CreateProcuradorInvestidorDto,
  ) {
    const url = `${this.urlBase}/${cnpj}/procuradores-investidores`;

    return this.enviarRequisicao(url, createProcuradorInvestidorDto);
  }

  async cadastrarRepresentantesLegaisInvestidores(
    cnpj: string,
    createRepresentanteLegalDto: CreateRepresentanteLegalDto,
  ) {
    const url = `${this.urlBase}/${cnpj}/representantes-legais-investidores`;

    return this.enviarRequisicao(url, createRepresentanteLegalDto);
  }

  private async enviarRequisicao(
    url: string,
    body:
      | CreateCedenteDto
      | CreateContaCorrenteDto
      | CreateContatoDto
      | CreateProcuradorInvestidorDto
      | CreateRepresentanteLegalDto,
    identificadorGerente?: string,
  ) {
    const cabecalhos = {
      'Content-Type': 'application/json',
      'X-API-KEY': sigmaHeaders['X-API-KEY'],
    };

    const corpo = identificadorGerente
      ? { ...body, identificadorGerente }
      : body;

    const opcoes = {
      method: 'POST',
      headers: cabecalhos,
      body: JSON.stringify(corpo),
    };

    const resposta = await fetch(url, opcoes);

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new HttpException(
        dados.message || 'Erro na comunicação com o serviço externo',
        dados.statusCode || 502,
      );
    }

    return dados;
  }
}
