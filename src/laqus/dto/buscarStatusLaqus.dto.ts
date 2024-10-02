import { IsNotEmpty, IsString } from 'class-validator';

export class BuscarStatusLaqusDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
