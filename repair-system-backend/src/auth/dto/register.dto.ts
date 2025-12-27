import { IsIn, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'ФИО должно быть не менее 3 символов' })
  fio: string;

  @IsString()
  @MinLength(10, { message: 'Телефон должен быть не менее 10 символов' })
  phone: string;

  @IsString()
  @MinLength(3, { message: 'Логин должен быть не менее 3 символов' })
  login: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  password: string;

  @IsIn(['Manager', 'Specialist', 'Operator', 'Customer', 'QualityManager'], {
    message: 'Неверная роль',
  })
  role: string;
}
