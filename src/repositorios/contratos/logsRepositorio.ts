import { Log } from 'src/@types/entities/logEntities';
import { Repositorio } from './repositorio';

export abstract class LogsRepositorio extends Repositorio {
  abstract criarLog(log: any): Promise<void>;
  abstract buscarTodosLogs(): Promise<Log[] | null>;
  abstract buscarLogPorId(id: string): Promise<Log | null>;
  abstract buscarLogsPorData(date: Date): Promise<Log[] | null>;
  abstract buscarLogsPorPeriodo(
    dataInicio: Date,
    dataFinal: Date,
  ): Promise<Log[] | null>;
}
