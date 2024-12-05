import { Injectable } from '@nestjs/common';
import { AdaptadorDb } from './adaptadorDb';
import { ClientSession } from 'mongodb';
import { MongoService } from 'src/app/global/db/mongodb/mongo.service';
import { Repositorio } from 'src/repositorios/contratos/repositorio';

@Injectable()
export class MongoAdaptadorDb implements AdaptadorDb {
  constructor(private mongo: MongoService) {}

  async fazerTransacao<T>(
    operacao: (sessao: ClientSession) => Promise<T>,
    repositorio: Repositorio[],
  ): Promise<T> {
    return await this.mongo.fazerTransacao(operacao, repositorio);
  }
}
