export interface User {
  userId: number;
  email: string;
}

import { Request } from 'express';

export interface CustomRequest extends Request {
  user: User;
}
