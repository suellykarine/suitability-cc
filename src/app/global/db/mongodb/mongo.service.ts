import { Injectable, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { MongoClient, Db, ClientSession } from 'mongodb';
import { Repositorio } from 'src/repositorios/contratos/repositorio';
import {
  definirContextosDeTransacao,
  removerContextosDeTransacao,
} from 'src/utils/funcoes/repositorios';

@Injectable()
export class MongoService implements OnModuleDestroy {
  private client: MongoClient;
  private db: Db;
  private readonly logger = new Logger(MongoService.name);

  constructor(
    @Inject('MONGO_CONNECTION') connection: { client: MongoClient; db: Db },
  ) {
    this.client = connection.client;
    this.db = connection.db;
    this.logger = new Logger(MongoService.name);
  }

  getDb(): Db {
    return this.db;
  }

  async onModuleDestroy() {
    await this.client.close();
    this.logger.log('Desconectado do MongoDB');
  }
  async fazerTransacao<T>(
    operacao: (sessao: ClientSession) => Promise<T>,
    repositorios: Repositorio[],
  ): Promise<T> {
    const sessao = this.client.startSession();
    sessao.startTransaction();
    definirContextosDeTransacao({ repositorios, contexto: sessao });

    try {
      const dadosRetornados = await operacao(sessao);
      await sessao.commitTransaction();
      return dadosRetornados;
    } catch (error) {
      await sessao.abortTransaction();
      this.logger.error('Transação abortada pelo seguinte erro:', error);
      throw error;
    } finally {
      removerContextosDeTransacao({ repositorios });
      sessao.endSession();
    }
  }
}
