import { ObjectId } from 'mongodb';
import { LogTipo } from 'src/@types/entities/logEntities';

export interface LogsModel {
  _id?: ObjectId;
  mensagem: string;
  detalhes: string;
  acao: string;
  tipo: LogTipo;
  criadoEm: Date;
}
