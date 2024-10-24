import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'src/@types/entities/jwt';

export function decodificarToken(token?: string): JwtPayload | null {
  if (!token) return null;
  try {
    const decoded = jwt.decode(token) as JwtPayload;

    return decoded;
  } catch (error) {
    return null;
  }
}
