import { ObjectId } from 'mongodb';
import { LogTipo } from 'src/@types/entities/logEntities';

export interface LogsModel {
  _id?: ObjectId;
  mensagem: string;
  informacaoAdicional: string;
  acao: string;
  tipo: LogTipo;
  criadoEm: Date;
}
