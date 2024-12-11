import { HttpException } from '@nestjs/common';

type AppErrorProps = {
  mensagem: string;
  codigoStatus: number;
  acao: string;
  informacaoAdicional?: Record<string, unknown>;
  salvarEmLog?: boolean;
};

export class ErroAplicacao extends HttpException {
  public readonly codigoStatus: number;
  public readonly informacaoAdicional?: Record<string, unknown>;
  public readonly acao: string;
  public readonly salvarEmLog: boolean;

  constructor({
    mensagem,
    codigoStatus,
    informacaoAdicional,
    acao,
    salvarEmLog = true,
  }: AppErrorProps) {
    super(mensagem, codigoStatus);
    this.codigoStatus = codigoStatus;
    this.acao = acao;
    this.informacaoAdicional = informacaoAdicional;
    this.salvarEmLog = salvarEmLog;
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
