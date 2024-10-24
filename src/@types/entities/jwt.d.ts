export type JwtPayload = {
  email: string;
  idUsuario: number;
  tipoUsuario: UserType;
  exp: number;
};
