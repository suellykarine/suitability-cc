import { HttpException } from '@nestjs/common';

export type AppErrorProps = {
  mensagem: string;
  codigoStatus: number;
  acao: string;
  detalhes?: Record<string, unknown>;
  salvarEmLog?: boolean;
};

export class ErroAplicacao extends HttpException {
  public readonly codigoStatus: number;
  public readonly detalhes?: Record<string, unknown>;
  public readonly acao: string;
  public readonly salvarEmLog: boolean;
  public readonly mensagem: string;

  constructor({
    mensagem,
    codigoStatus,
    detalhes,
    acao,
    salvarEmLog = true,
  }: AppErrorProps) {
    super(mensagem, codigoStatus);
    this.codigoStatus = codigoStatus;
    this.acao = acao;
    this.detalhes = detalhes;
    this.salvarEmLog = salvarEmLog;
    this.mensagem = mensagem;
  }
}

export class ErroRequisicaoInvalida extends ErroAplicacao {
  constructor(erroAplicacao: Omit<AppErrorProps, 'codigoStatus'>) {
    super({
      ...erroAplicacao,
      codigoStatus: 400,
    });
  }
}

export class ErroConflitoRequisicao extends ErroAplicacao {
  constructor(erroAplicacao: Omit<AppErrorProps, 'codigoStatus'>) {
    super({
      ...erroAplicacao,
      codigoStatus: 409,
    });
  }
}

export class ErroServidorInterno extends ErroAplicacao {
  constructor(erroAplicacao: Omit<AppErrorProps, 'codigoStatus'>) {
    super({ codigoStatus: 500, ...erroAplicacao });
  }
}

export class ErroNaoAutorizado extends ErroAplicacao {
  constructor(erroAplicacao: Omit<AppErrorProps, 'codigoStatus'>) {
    super({ codigoStatus: 401, ...erroAplicacao });
  }
}

export class ErroNaoEncontrado extends ErroAplicacao {
  constructor(erroAplicacao: Omit<AppErrorProps, 'codigoStatus'>) {
    super({ codigoStatus: 404, ...erroAplicacao });
  }
}

export class ErroNaoProcessavel extends ErroAplicacao {
  constructor(erroAplicacao: Omit<AppErrorProps, 'codigoStatus'>) {
    super({ codigoStatus: 422, ...erroAplicacao });
  }
}
