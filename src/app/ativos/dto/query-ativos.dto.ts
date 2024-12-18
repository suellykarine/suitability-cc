import { IsOptional, IsString } from 'class-validator';
export class QueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  valor_minimo_percentual_garantia?: string;

  @IsOptional()
  @IsString()
  valor_maximo_percentual_garantia?: string;

  @IsOptional()
  @IsString()
  valor_minimo_prazo_dias?: string;

  @IsOptional()
  @IsString()
  valor_maximo_prazo_dias?: string;

  @IsOptional()
  @IsString()
  tir_valor_minimo?: string;

  @IsOptional()
  @IsString()
  tir_valor_maximo?: string;

  @IsOptional()
  @IsString()
  scores?: string;
}
