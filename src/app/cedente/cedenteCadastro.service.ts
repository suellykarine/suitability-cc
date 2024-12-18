import { Injectable } from '@nestjs/common';
import { CreateCedenteDto } from './dto/create-cedente.dto';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from '../autenticacao/constants';
import { CreateContaCorrenteDto } from './dto/create-conta-corrente.dto';
import { CreateContatoDto } from './dto/create-contato.dto';
import { CreateProcuradorInvestidorDto } from './dto/create-procurador-investidor.dto';
import { CreateRepresentanteLegalDto } from './dto/create-representante-legal.dto';
import { Cedente } from 'src/@types/entities/cedente';
import { tratarErroRequisicao } from '../../utils/funcoes/erros';

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
    const logAcao = 'cedenteCadastro.enviarRequisicao';
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

    const req = await fetch(url, opcoes);
    const resposta = await req.json();

    if (!req.ok) {
      await tratarErroRequisicao({
        status: req.status,
        acao: logAcao,
        mensagem: `Erro ao solicitar informacoes do cedente: ${req.status}`,
        req,
        infoAdicional: {
          status: req.status,
          texto: req.statusText,
          body,
          identificadorGerente,
          url,
        },
      });
    }

    return resposta;
  }

  async buscarDadosPJ(identificadorFundo: string): Promise<Cedente> {
    const logAcao = 'cedenteCadastro.buscarDadosPJ';
    const url = `${this.urlBase}/${identificadorFundo}`;

    const req = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': sigmaHeaders['X-API-KEY'],
      },
    });

    const dados = (await req.json()) as Cedente;

    if (!req.ok) {
      await tratarErroRequisicao({
        status: req.status,
        acao: logAcao,
        mensagem: `Erro ao buscar os dados PJ: ${req.status}`,
        req,
        infoAdicional: {
          status: req.status,
          texto: req.statusText,
          identificadorFundo,
          url,
        },
      });
    }
    return dados;
  }
}
