import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
export class OrganizaCarteirasParamsDto {
  @IsString()
  @IsOptional()
  fundoInvestidor: string;

  @IsDateString()
  @IsOptional()
  data: string;

  @IsString()
  @IsOptional()
  qtativos: string;

  @IsString()
  @IsOptional()
  status: string;

  @IsNumber()
  @IsOptional()
  totalInvestimento: number;
}

export class identificadorCedente {
  @IsString()
  identificadorInvestidor: string;
}
