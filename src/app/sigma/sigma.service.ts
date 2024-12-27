import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sigmaHeaders } from '../autenticacao/constants';
import { tratarErroRequisicao } from 'src/utils/funcoes/erros';

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
      await tratarErroRequisicao({
        acao: 'sigmaService.excluirOperacaoDebentureSigma.fetch',
        mensagem: `Erro ao excluir operação: ${req.status}`,
        req,
        detalhes: {
          codigoOperacao,
          complementoStatusOperacao,
        },
      });
    const res = { sucesso: true, codigoOperacao };
    return res;
  }
}
