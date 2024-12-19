import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from '../autenticacao/constants';
import { AprovarDocumentoDto } from './dto/aprovar-documento.dto';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { File } from 'buffer';
import { tratarErroRequisicao } from '../../utils/funcoes/erros';

@Injectable()
export class DocumentoCedenteService {
  private readonly urlBaseDocumentos: string;

  constructor(private configService: ConfigService) {
    this.urlBaseDocumentos = this.configService.get<string>(
      'BASE_URL_DOCUMENTOS_CEDENTE',
    );
  }
  async aprovarDocumento(id: string, dados: AprovarDocumentoDto) {
    const resposta = await fetch(`${this.urlBaseDocumentos}/${id}/aprovar`, {
      method: 'PUT',
      headers: this.getCabecalhos(),
      body: JSON.stringify(dados),
    });

    return resposta.status === 204 ? null : this.tratarResposta(resposta);
  }

  async buscarDocumentosPorCnpj(cnpj: string) {
    const urlConsulta = `${this.urlBaseDocumentos}?identificadorCedente=${cnpj}&tipoPessoa=CEDENTE`;

    const resposta = await fetch(urlConsulta, {
      headers: this.getCabecalhos(),
    });

    return this.tratarResposta(resposta);
  }

  async registrarDocumento(
    arquivo: any,
    createDocumentoDto: CreateDocumentoDto,
  ) {
    const formData = new FormData();

    formData.append(
      'identificadorCedente',
      createDocumentoDto.identificadorCedente,
    );
    formData.append('tipoPessoa', createDocumentoDto.tipoPessoa);
    formData.append('documento', createDocumentoDto.documento);

    if (createDocumentoDto.identificadorPessoa) {
      formData.append(
        'identificadorPessoa',
        createDocumentoDto.identificadorPessoa,
      );
    }

    const arquivoUpload = new File([arquivo.buffer], arquivo.originalname, {
      type: arquivo.mimetype,
    });
    formData.append('arquivo', arquivoUpload);

    const resposta = await fetch(this.urlBaseDocumentos, {
      method: 'POST',
      headers: { 'X-API-KEY': sigmaHeaders['X-API-KEY'] },
      body: formData,
    });

    return this.tratarResposta(resposta);
  }

  private async tratarResposta(req: Response) {
    const dadosResposta = await req.json();
    if (!req.ok) {
      await tratarErroRequisicao({
        acao: 'cedenteDocumentos.tratarResposta',
        mensagem: `Erro ao solicitar informacoes do cedente: ${req.status}`,
        req,
        informacaoAdicional: {
          status: req.status,
          texto: req.statusText,
        },
      });
    }
    return dadosResposta;
  }

  private getCabecalhos(contentType: string = 'application/json') {
    return {
      'X-API-KEY': sigmaHeaders['X-API-KEY'],
      'Content-Type': contentType,
    };
  }
}
