import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from '../autenticacao/constants';

type BodyExcluirOperacao = {
  codigoOperacao: string;
  complementoStatusOperacao: string;
};
@Injectable()
export class SigmaService {
  private baseUrlOperacoesInvest: string;
  constructor(private readonly configService: ConfigService) {
    this.baseUrlOperacoesInvest = this.configService.get(
      'BASE_URL_OPERACOES_INVEST',
    );
  }

  public async excluirOperacaoDebentureSigma({
    codigoOperacao,
    complementoStatusOperacao,
  }: BodyExcluirOperacao) {
    const req = await fetch(
      `${this.baseUrlOperacoesInvest}fluxo-operacional/v1/operacoes-invest/${codigoOperacao}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': sigmaHeaders['X-API-KEY'],
        },
        body: JSON.stringify({
          complementoStatusOperacao,
        }),
      },
    );
    if (!req.ok)
      throw new HttpException(
        `Erro ao excluir operação no sigma: ${req.status} ${req.statusText}`,
        req.status,
      );

    const res = { sucesso: true, codigoOperacao };
    return res;
  }
}
