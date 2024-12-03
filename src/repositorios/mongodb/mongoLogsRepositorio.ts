import { LogsModel } from 'src/app/global/db/mongodb/models.interface';
import { MongoService } from 'src/app/global/db/mongodb/mongo.service';
import { ClientSession, Collection, Db, ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { Log } from 'src/@types/entities/logEntities';
import { LogsRepositorio } from '../contratos/logsRepositorio';

@Injectable()
export class MongoLogsRepositorio implements LogsRepositorio {
  private db: Db;
  private collection: Collection<LogsModel>;
  private session: ClientSession | null = null;

  constructor(private mongoService: MongoService) {
    this.db = this.mongoService.getDb();
    this.collection = this.db.collection<LogsModel>('logs');
  }

  definirContextoDaTransacao(contexto: ClientSession): void {
    this.session = contexto;
  }

  removerContextoDaTransacao(): void {
    this.session = null;
  }

  async criarLog(log: Log): Promise<void> {
    await this.collection.insertOne(log, { session: this.session });
  }

  async buscarTodosLogs(): Promise<Log[]> {
    const logsEncontrados = await this.collection.find().toArray();

    const logs: Log[] = logsEncontrados.map(({ _id, ...log }) => ({
      ...log,
      id: _id.toString(),
    }));

    return logs;
  }

  async buscarLogPorId(id: string): Promise<Log | null> {
    const logEncontrado = await this.collection.findOne({
      _id: new ObjectId(id),
    });

    if (!logEncontrado) {
      return null;
    }

    const { _id, ...log } = logEncontrado;

    return {
      ...log,
      id: _id.toString(),
    };
  }

  async buscarLogsPorData(date: Date): Promise<Log[]> {
    const logsEncontrados = await this.collection
      .find({ criadoEm: date })
      .toArray();

    const logs: Log[] = logsEncontrados.map(({ _id, ...log }) => ({
      ...log,
      id: _id.toString(),
    }));

    return logs;
  }

  async buscarLogsPorPeriodo(
    dataInicio: Date,
    dataFinal: Date,
  ): Promise<Log[]> {
    const logsEncontrados = await this.collection
      .find({
        criadoEm: {
          $gte: dataInicio,
          $lte: dataFinal,
        },
      })
      .toArray();

    const logs: Log[] = logsEncontrados.map(({ _id, ...log }) => ({
      ...log,
      id: _id.toString(),
    }));

    return logs;
  }
}
