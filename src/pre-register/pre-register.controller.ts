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
  Request,
} from '@nestjs/common';
import { PreRegisterService } from './pre-register.service';
import { UpdatePreRegisterDto } from './dto/update-pre-register.dto';
import { JwtAuthGuardBackoffice } from 'src/auth/guards/backoffice-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtAuthGuardPreRegister } from 'src/auth/guards/pre-register-auth.guard';
import { CreatePreRegisterDto } from './dto/create-pre-register.dto';

@ApiTags('pre-register')
@Controller('api/pre-register')
export class PreRegisterController {
  constructor(private readonly preRegisterService: PreRegisterService) {}

  @UseGuards(JwtAuthGuardBackoffice)
  @Get()
  findAll() {
    return this.preRegisterService.findAll();
  }

  @UseGuards(JwtAuthGuardPreRegister)
  @Get('password')
  findLetter(@Request() req) {
    const invitationLetter = req.invitationLetter;
    return this.preRegisterService.findLetter(invitationLetter);
  }

  @UseGuards(JwtAuthGuardPreRegister)
  @Post('password')
  createUser(
    @Body() createPreRegisterDto: CreatePreRegisterDto,
    @Request() req: any,
    @Headers() headers: any,
  ) {
    const invitationLetter = req.invitationLetter;
    const token = headers.authorization.split(' ')[1];

    return this.preRegisterService.createUser(
      createPreRegisterDto,
      invitationLetter,
      token,
    );
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
