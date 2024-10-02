import { IsNotEmpty, IsString } from 'class-validator';

export class AutenticarLaqusDto {
  @IsString({ message: 'O campo apiKey deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo apiKey não pode estar vazio.' })
  apiKey: string;

  @IsString({ message: 'O campo secretKey deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo secretKey não pode estar vazio.' })
  secretKey: string;
}
