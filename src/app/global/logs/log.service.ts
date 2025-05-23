import { Injectable, Logger } from '@nestjs/common';
import { LogsRepositorio } from 'src/repositorios/contratos/logsRepositorio';
import { normalizarChaves, removerCiclos } from 'src/utils/funcoes/objetos';
import { OptionalNullable } from 'src/utils/types';
import * as moment from 'moment-timezone';
import { Log, LogTipo } from 'src/@types/entities/logEntities';

type LogProps = Omit<OptionalNullable<Log>, 'id' | 'criadoEm' | 'detalhes'> &
  Partial<{
    detalhes: Record<string, unknown>;
    formatoDetalhes?: 'json' | 'string';
    exibirNoConsole?: boolean;
  }>;

@Injectable()
export class LogService {
  private readonly logger = new Logger('LogService');
  constructor(private readonly logsRepository: LogsRepositorio) {}

  async log({
    exibirNoConsole = false,
    formatoDetalhes = 'json',
    tipo,
    ...log
  }: LogProps) {
    const objetoSelecionadorDeLogSistema = {
      INFO: this.logger.log.bind(this.logger),
      ERRO: this.logger.error.bind(this.logger),
      AVISO: this.logger.warn.bind(this.logger),
    } as Record<LogTipo, (mensagem: string) => void>;

    const funcaoLogSistemaSelecionada = objetoSelecionadorDeLogSistema[tipo];

    const detalhesNormalizados = normalizarChaves(removerCiclos(log.detalhes));
    const criadoEm = moment().tz('America/Sao_Paulo').format();
    const manterFormato = formatoDetalhes === 'json';
    const detalhes = manterFormato
      ? detalhesNormalizados
      : JSON.stringify(detalhesNormalizados);
    const payload = {
      ...log,
      criadoEm,
      detalhes: detalhes,
    };
    if (exibirNoConsole) funcaoLogSistemaSelecionada(payload.mensagem);

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
