import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByLogin(dto.login);
    if (exists) throw new BadRequestException('Login already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      fio: dto.fio,
      phone: dto.phone,
      login: dto.login,
      passwordHash,
      role: dto.role as any,
    });

    const token = this.jwtService.sign({
      sub: user.id,
      login: user.login,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        fio: user.fio,
        login: user.login,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByLogin(dto.login);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({
      sub: user.id,
      login: user.login,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        fio: user.fio,
        login: user.login,
        role: user.role,
      },
    };
  }

  async me(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      fio: user.fio,
      login: user.login,
      role: user.role,
      phone: user.phone,
    };
  }
}
