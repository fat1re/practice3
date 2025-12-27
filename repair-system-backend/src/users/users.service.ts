import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
  ) {}

  create(data: { fio: string; phone: string; login: string; passwordHash: string; role: UserRole }) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  findByLogin(login: string) {
    return this.repo.findOne({ where: { login } });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  list() {
    return this.repo.find({ select: ['id', 'fio', 'phone', 'login', 'role'] });
  }

  listSpecialists() {
    return this.repo.find({
      where: { role: 'Specialist' },
      select: ['id', 'fio', 'phone', 'login', 'role'],
    });
  }
}
