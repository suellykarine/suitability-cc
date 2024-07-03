import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Headers,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { PreRegisterService } from './pre-register.service';
import { CreatePreRegisterDto } from './dto/create-pre-register.dto';
import { UpdatePreRegisterDto } from './dto/update-pre-register.dto';
import { JwtAuthGuardBackoffice } from 'src/auth/guards/backoffice-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('pre-register')
@Controller('api/pre-register')
export class PreRegisterController {
  constructor(private readonly preRegisterService: PreRegisterService) {}

  @Post()
  create(@Body() createPreRegisterDto: CreatePreRegisterDto) {
    return this.preRegisterService.create(createPreRegisterDto);
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Get()
  findAll(@Headers() headers: any) {
    console.log(headers.authorization);
    return this.preRegisterService.findAll();
  }

  @UseGuards(JwtAuthGuardBackoffice)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.preRegisterService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePreRegisterDto: UpdatePreRegisterDto,
  ) {
    return this.preRegisterService.update(+id, updatePreRegisterDto);
  }

  @HttpCode(204)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Headers() headers: any) {
    const token = headers.authorization.split(' ')[1];
    return this.preRegisterService.remove(+id, token);
  }
}
