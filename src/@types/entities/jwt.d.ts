export type JwtPayload = {
  email: string;
  idUsuario: number;
  tipoUsuario: string;
  exp?: number;
  iat?: number;
};
