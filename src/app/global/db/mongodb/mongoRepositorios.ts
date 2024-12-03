import { LogsRepositorio } from 'src/repositorios/contratos/logsRepositorio';
import { MongoLogsRepositorio } from 'src/repositorios/mongodb/mongoLogsRepositorio';

export const mongoRepositorios = [
  {
    provide: LogsRepositorio,
    useClass: MongoLogsRepositorio,
  },
];
