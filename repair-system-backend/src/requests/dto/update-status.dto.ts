import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @MinLength(2)
  status: string;

  @IsOptional()
  @IsBoolean()
  setCompletionDate?: boolean;
}
