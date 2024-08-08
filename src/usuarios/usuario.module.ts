import { Module } from '@nestjs/common';
import { ServicoUsuario } from './usuario.service';

@Module({
  providers: [ServicoUsuario],
  exports: [ServicoUsuario],
})
export class UsuariosModule {}
