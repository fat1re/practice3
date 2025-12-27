import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateRepairRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  climateTechType: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  climateTechModel: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  description: string;
}
