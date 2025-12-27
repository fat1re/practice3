import { IsOptional, IsString } from 'class-validator';

export class UpdateRepairRequestDto {
  @IsOptional()
  @IsString()
  climateTechType?: string;

  @IsOptional()
  @IsString()
  climateTechModel?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requestStatus?: string;
}
