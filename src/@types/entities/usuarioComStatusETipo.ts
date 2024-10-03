import { status_usuario, tipo_usuario, usuario } from '@prisma/client';

export type UsuarioComStatusETipo = usuario & {
  status_usuario: status_usuario;
  tipo_usuario: tipo_usuario;
};
