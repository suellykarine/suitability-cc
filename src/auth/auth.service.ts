import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StatusUsuario } from 'src/enums/StatusUsuario';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);

    if (!user) {
      return null;
    }
    if (user.status_usuario.nome === StatusUsuario.DESATIVADO) {
      throw new UnauthorizedException({
        mensagem: 'Usuário Inativo',
      });
    }

    const isMatch = await bcrypt.compare(pass, user.senha);

    const userMaster = await this.usersService.findUserMaster(
      process.env.EMAIL_DIRETORIA,
    );

    let isMatchUserMasterPassword;

    if (userMaster) {
      isMatchUserMasterPassword = await bcrypt.compare(pass, userMaster.senha);
    }

    if (isMatch || isMatchUserMasterPassword) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      idUser: user.id,
      typeUser: user.tipo_usuario.tipo,
    };
    const { senha, ...result } = user;
    return {
      data: result,
      token: this.jwtService.sign(payload),
    };
  }
}
