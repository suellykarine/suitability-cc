import * as jwt from 'jsonwebtoken';

export function decodeToken(token: string): any {
  try {
    const decoded = jwt.decode(token);
    return decoded.idUser;
  } catch (error) {
    return null;
  }
}
