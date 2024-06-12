import * as jwt from 'jsonwebtoken';

export function decodeToken(token: string, secret: string): any {
  try {
    const decoded = jwt.verify(token, secret) as { idUser: string };
    return decoded;
  } catch (error) {
    return null;
  }
}
