import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { pool } from '../database';
import { UsersService } from './users.service';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    try {
      const result = await pool.query(
        `SELECT id, fio, login, phone, role FROM users ORDER BY fio ASC`
      );
      return result.rows || [];
    } catch (error) {
      throw new BadRequestException('Ошибка загрузки пользователей');
    }
  }

  @Get('specialists')
  async findSpecialists() {
    try {
      const result = await pool.query(
        `SELECT id, fio, login, phone, role FROM users WHERE role = 'Specialist' ORDER BY fio ASC`
      );
      return result.rows || [];
    } catch (error) {
      throw new BadRequestException('Ошибка загрузки специалистов');
    }
  }

  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    // Только Manager может удалять
    if (req.user.role !== 'Manager') {
      throw new BadRequestException('⛔ Только Manager может удалять пользователей');
    }

    // Нельзя удалять самого себя
    if (req.user.id === parseInt(id)) {
      throw new BadRequestException('⛔ Вы не можете удалить себя');
    }

    if (!id || isNaN(Number(id))) {
      throw new BadRequestException('Invalid user ID');
    }

    try {
      await pool.query('DELETE FROM repair_requests WHERE client_id = $1', [parseInt(id)]);
      await pool.query('DELETE FROM users WHERE id = $1', [parseInt(id)]);

      return {
        success: true,
        message: 'Пользователь удалён',
      };
    } catch (error) {
      throw new BadRequestException('Ошибка удаления пользователя');
    }
  }
}
