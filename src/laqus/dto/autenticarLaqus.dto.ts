import { IsNotEmpty, IsString } from 'class-validator';

export class AutenticarLaqusDto {
  @IsNotEmpty({ message: 'O campo apiKey não pode estar vazio.' })
  @IsString({ message: 'O campo apiKey deve ser uma string.' })
  apiKey: string;

  @IsNotEmpty({ message: 'O campo secretKey não pode estar vazio.' })
  @IsString({ message: 'O campo secretKey deve ser uma string.' })
  secretKey: string;
}
