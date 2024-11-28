import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AtualizarSenhaDto } from './dto/atualizar-senha.dto';
import { Usuario } from 'src/@types/entities/usuario';
import { UsuarioRepositorio } from 'src/repositorios/contratos/usuarioRepositorio';

@Injectable()
export class UsuarioService {
  constructor(private usuarioRepositorio: UsuarioRepositorio) {}

  async encontrarUsuario(email: string): Promise<Usuario | undefined> {
    const usuario = await this.usuarioRepositorio.encontrarPorEmail(email);

    return usuario;
  }

  async atualizarSenha(idUsuario: number, { senha }: AtualizarSenhaDto) {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await this.usuarioRepositorio.atualizar(idUsuario, {
      senha: senhaCriptografada,
    });

    return { mensagem: 'Senha alterada com sucesso' };
  }
}
