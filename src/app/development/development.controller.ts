import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DevelopmentService } from './development.service';
import { JwtAuthGuardDevelopment } from '../autenticacao/guards/development.guard';

@Controller('api/development')
export class DevelopmentController {
  constructor(private readonly developmentService: DevelopmentService) {}

  @UseGuards(JwtAuthGuardDevelopment)
  @Post('sandbox')
  sandbox(@Body() args: any) {
    return this.developmentService.sandbox(args);
  }
}
