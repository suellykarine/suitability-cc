import { Injectable, Logger } from '@nestjs/common';
import { Log } from 'src/@types/entities/logEntities';
import { LogsRepositorio } from 'src/repositorios/contratos/logsRepositorio';
import { OptionalNullable } from 'src/utils/types';

type LogProps = Omit<
  OptionalNullable<Log>,
  'id' | 'criadoEm' | 'informacaoAdicional'
> &
  Partial<{
    informacaoAdicional: Record<string, unknown>;
    exibirNoConsole?: boolean;
  }>;

@Injectable()
export class LogService {
  private readonly logger = new Logger('LogService');
  constructor(private readonly logsRepository: LogsRepositorio) {}

  async log({ exibirNoConsole = false, ...log }: LogProps) {
    const payload = {
      ...log,
      criadoEm: new Date().toISOString(),
      informacaoAdicional: JSON.stringify(log.informacaoAdicional),
    };
    if (exibirNoConsole) this.logger.log(payload.mensagem);
    await this.logsRepository.criarLog(payload);
  }

  async info(log: Omit<LogProps, 'tipo'>) {
    await this.log({
      tipo: 'INFO',
      ...log,
    });
  }

  async erro(log: Omit<LogProps, 'tipo'>) {
    await this.log({
      tipo: 'ERRO',
      exibirNoConsole: true,
      ...log,
    });
  }

  async aviso(log: Omit<LogProps, 'tipo'>) {
    await this.log({
      tipo: 'AVISO',
      exibirNoConsole: true,
      ...log,
    });
  }
}
