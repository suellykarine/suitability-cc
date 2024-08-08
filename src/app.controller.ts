import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { ServiçoDeAutenticacao } from './auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private serviçoDeAutenticacao: ServiçoDeAutenticacao,
  ) {}

  @ApiTags('health')
  @ApiOperation({ summary: 'Rota de health da aplicação' })
  @Get()
  getHealth(): string {
    return this.appService.getService();
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiTags('login')
  @Post('api/login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.serviçoDeAutenticacao.login(req.user);
  }
}
