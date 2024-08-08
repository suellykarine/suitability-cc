import * as jwt from 'jsonwebtoken';

export function decodificarToken(token: string): any {
  try {
    const decoded = jwt.decode(token);
    return decoded.idUser;
  } catch (error) {
    return null;
  }
}
