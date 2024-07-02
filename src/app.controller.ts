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
import { AuthService } from './auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
  ) {}

  @ApiTags('health')
  @ApiOperation({ summary: 'Check health of the application' })
  @Get()
  getHealth(): string {
    return this.appService.getService();
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiTags('login')
  @Post('api/login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }
}
