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
import { LocalAuthGuard } from './app/auth/guards/local-auth.guard';
import { AutenticacaoService } from './app/auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private autenticacaoService: AutenticacaoService,
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
    console.log('entrando no login...');
    return this.autenticacaoService.login(req.user);
  }
}
