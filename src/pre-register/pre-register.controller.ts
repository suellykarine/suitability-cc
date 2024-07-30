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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtAuthGuardPreRegister } from 'src/auth/guards/pre-register-auth.guard';
import {
  CreatePreRegisterDto,
  CreateVerificationCodeDto,
} from './dto/create-pre-register.dto';
import { CustomRequest } from 'src/utils/interfaces/request.interface';

@ApiTags('pre-register')
@ApiBearerAuth('access-token')
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

  @Post('auth')
  sendVerificationCode(
    @Body() createVerificationCodeDto: CreateVerificationCodeDto,
  ) {
    return this.preRegisterService.sendVerificationCode(
      createVerificationCodeDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: CustomRequest) {
    const requestUserId = req.user.userId;
    return this.preRegisterService.findOne(+id, requestUserId);
  }

  @HttpCode(204)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @Headers() headers: any,
    @Request() req: CustomRequest,
  ) {
    const requestUserId = req.user.userId;
    const token = headers.authorization.split(' ')[1];
    return this.preRegisterService.remove(+id, token, requestUserId);
  }
}
