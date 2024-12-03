import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EnderecoDto } from 'src/utils/dtos/endereçoDto';
import { TelefoneDto } from 'src/utils/dtos/telefoneDto';

class DadosAssinaturaDto {
  @IsString()
  tipoAssinatura: string;

  @IsString()
  dataValidadeAssinatura: string;

  @IsBoolean()
  possuiCertificadoDigital: boolean;
}

export class atualizarRepresentanteLegalDto {
  @IsString()
  nome: string;

  @ValidateNested()
  @Type(() => EnderecoDto)
  @IsObject()
  endereco: EnderecoDto;

  @ValidateNested()
  @Type(() => TelefoneDto)
  @IsObject()
  telefone: TelefoneDto;

  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => DadosAssinaturaDto)
  @IsObject()
  dadosAssinatura: DadosAssinaturaDto;
}
