import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErroNaoEncontrado } from 'src/helpers/erroAplicacao';

@Injectable()
export class CcbService {
  private baseUrlCCBs: string;
  constructor(private readonly configService: ConfigService) {
    this.baseUrlCCBs = this.configService.get('BASE_URL_CCB');
  }

  public async buscarCCCBAssinada(codigoAtivo: number) {
    const logAcao = 'ccbBuscarCcbAssinada';
    const req = await fetch(
      `${this.baseUrlCCBs}arquivo/v1/arquivos/invest/assinado?codigoOperacao=${codigoAtivo}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!req.ok) {
      throw new ErroNaoEncontrado({
        acao: logAcao,
        mensagem: `erro ao buscar CCB assinada`,
        informacaoAdicional: {
          status: req.status,
        },
      });
    }

    return await req.json();
  }

  public async buscarCCBParaExternalizar(codigoAtivo: number) {
    const buscaCCB = await this.buscarCCCBAssinada(codigoAtivo);
    const baseUrlExternalizarCCB = process.env.BASE_URL_EXTERALIZAR_CCB;

    const url = new URL(buscaCCB.url);
    const chaveAcesso = url.searchParams.get('chaveAcesso');

    const urlParaExternalizar = `${baseUrlExternalizarCCB}arquivos/hash?chaveAcesso=${chaveAcesso}`;

    return urlParaExternalizar;
  }
}
