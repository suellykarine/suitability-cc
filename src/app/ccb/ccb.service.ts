import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tratarErroRequisicao } from '../../utils/funcoes/erros';

@Injectable()
export class CcbService {
  private baseUrlCCBs: string;
  constructor(private readonly configService: ConfigService) {
    this.baseUrlCCBs = this.configService.get('BASE_URL_CCB');
  }

  public async buscarCCBAssinada(codigoAtivo: number) {
    const logAcao = 'ccb.buscarCcbAssinada';
    const req = await fetch(
      `${this.baseUrlCCBs}arquivo/v1/arquivos/invest/assinado?codigoOperacao=${codigoAtivo}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!req.ok) {
      await tratarErroRequisicao({
        acao: logAcao,
        mensagem: `erro ao buscar CCB assinada: ${req.status}`,
        req,
        detalhes: {
          status: req.status,
          texto: req.statusText,
          codigoAtivo,
        },
      });
    }

    return await req.json();
  }

  public async buscarCCBParaExternalizar(codigoAtivo: number) {
    const buscaCCB = await this.buscarCCBAssinada(codigoAtivo);
    const baseUrlExternalizarCCB = process.env.BASE_URL_EXTERALIZAR_CCB;

    const url = new URL(buscaCCB.url);
    const chaveAcesso = url.searchParams.get('chaveAcesso');

    const urlParaExternalizar = `${baseUrlExternalizarCCB}arquivos/hash?chaveAcesso=${chaveAcesso}`;

    return { url: urlParaExternalizar };
  }
}
