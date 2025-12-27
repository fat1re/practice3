import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepairRequest } from '../entities/repair-request.entity';
import { User } from '../entities/user.entity';
import { CreateRepairRequestDto } from './dto/create-request.dto';
import { UpdateRepairRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(RepairRequest)
    private readonly requestRepo: Repository<RepairRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

 async create(dto: CreateRepairRequestDto, userId: number) {
  console.log('Creating request for user:', userId, 'Data:', dto);

  const client = await this.userRepo.findOne({ where: { id: userId } });
  if (!client) {
    throw new BadRequestException('Клиент не найден');
  }

  try {
    // Генерируем уникальный номер заявки
    const number = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const request = this.requestRepo.create({
      number,
      climateTechType: dto.climateTechType?.trim(),
      climateTechModel: dto.climateTechModel?.trim(),
      problemDescription: dto.description?.trim(),
      requestStatus: 'Открыта',
      client,
    });

    const saved = await this.requestRepo.save(request);
    console.log('Request created successfully:', saved);
    
    return saved;
  } catch (error) {
    console.error('Error creating request:', error);
    throw new BadRequestException('Ошибка создания заявки: ' + error.message);
  }
}

  async findAll() {
    return this.requestRepo.find({
      relations: ['client', 'master'],
      order: { id: 'DESC' },
    });
  }

  async findByUserId(userId: number) {
    return this.requestRepo.find({
      where: { client: { id: userId } },
      relations: ['client', 'master'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number, userId: number, userRole: string) {
    const request = await this.requestRepo.findOne({
      where: { id },
      relations: ['client', 'master'],
    });

    if (!request) throw new BadRequestException('Заявка не найдена');

    // Клиент может видеть только свои заявки
    if (userRole === 'Customer' && request.client.id !== userId) {
      throw new BadRequestException('Доступ запрещён');
    }

    return request;
  }

  async update(id: number, dto: UpdateRepairRequestDto, userId: number, userRole?: string) {
  // Проверка доступа
  const allowedRoles = ['Manager', 'Admin', 'Operator', 'QualityManager'];
  if (userRole && !allowedRoles.includes(userRole)) {
    throw new BadRequestException('You do not have permission to update this request');
  }
    const request = await this.requestRepo.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!request) throw new BadRequestException('Заявка не найдена');

    // Только создатель заявки может редактировать (или Manager)
    if (request.client.id !== userId) {
      throw new BadRequestException('Вы не можете редактировать чужую заявку');
    }

    if (dto.climateTechType) request.climateTechType = dto.climateTechType;
    if (dto.climateTechModel) request.climateTechModel = dto.climateTechModel;
    if (dto.description) request.problemDescription = dto.description;
    if (dto.requestStatus) request.requestStatus = dto.requestStatus;

    return this.requestRepo.save(request);
  }

  async assign(id: number, specialistId: number) {
    const request = await this.requestRepo.findOne({
      where: { id },
      relations: ['master'],
    });

    if (!request) throw new BadRequestException('Заявка не найдена');

    const specialist = await this.userRepo.findOne({
      where: { id: specialistId },
    });

    if (!specialist) throw new BadRequestException('Специалист не найден');
    if (specialist.role !== 'Specialist') {
      throw new BadRequestException('Только специалист может быть назначен');
    }

    request.master = specialist;
    request.requestStatus = 'Назначена';
    return this.requestRepo.save(request);
  }

  async updateStatus(id: number, status: string) {
    const request = await this.requestRepo.findOne({ where: { id } });
    if (!request) throw new BadRequestException('Заявка не найдена');

    request.requestStatus = status;
    return this.requestRepo.save(request);
  }

  async remove(id: number, userId: number) {
    const request = await this.requestRepo.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!request) throw new BadRequestException('Заявка не найдена');

    return this.requestRepo.remove(request);
  }
}
