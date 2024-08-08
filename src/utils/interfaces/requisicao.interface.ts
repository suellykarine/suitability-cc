import { Request } from 'express';

export interface Usuario {
  idUsuario: number;
  email: string;
}
export interface RequisicaoPersonalizada extends Request {
  user: Usuario;
}
