import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import * as QRCode from 'qrcode';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { pool } from '../database';
import { CreateRepairRequestDto } from './dto/create-request.dto';
import { UpdateRepairRequestDto } from './dto/update-request.dto';
import { RequestsService } from './requests.service';

@Controller('api/repair-requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async create(@Body() dto: CreateRepairRequestDto, @Request() req: any) {
    return this.requestsService.create(dto, req.user.id);
  }

  @Get()
  async findAll(@Request() req: any) {
    const role = req.user.role;
    if (['Manager', 'Specialist', 'QualityManager', 'Operator', 'Admin'].includes(role)) {
      return this.requestsService.findAll();
    }
    return this.requestsService.findByUserId(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    if (!id || isNaN(Number(id))) {
      throw new BadRequestException('Invalid request ID');
    }
    return this.requestsService.findOne(+id, req.user.id, req.user.role);
  }

  @Get(':id/qrcode')
  async generateQRCode(@Param('id') id: string) {
    if (!id || isNaN(Number(id))) {
      throw new BadRequestException('Invalid request ID');
    }

    const surveyUrl = `https://docs.google.com/forms/d/e/1FAIpQLSdhZcExx6LSIXxk0ub55mSu-WIh23WYdGG9HY5EZhLDo7P8eA/viewform?usp=sf_link&entry.123456=${id}`;

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(surveyUrl);
      return { qrCode: qrCodeDataUrl, url: surveyUrl };
    } catch (error) {
      throw new BadRequestException('Failed to generate QR code');
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRepairRequestDto,
    @Request() req: any,
  ) {
    if (!id || isNaN(Number(id))) {
      throw new BadRequestException('Invalid request ID');
    }
    
    // Проверка доступа для изменения статуса
    const allowedRoles = ['Manager', 'Admin', 'Operator', 'QualityManager'];
    if (!allowedRoles.includes(req.user.role)) {
      throw new BadRequestException('You do not have permission to update requests');
    }

    return this.requestsService.update(+id, dto, req.user.id);
  }

  @Patch(':id/assign/:specialistId')
  async assign(
    @Param('id') id: string,
    @Param('specialistId') specialistId: string,
    @Request() req: any,
  ) {
    const allowedRoles = ['Manager', 'Operator', 'QualityManager', 'Admin'];
    if (!allowedRoles.includes(req.user.role)) {
      throw new BadRequestException('Only managers can assign specialists');
    }

    if (!id || isNaN(Number(id))) {
      throw new BadRequestException('Invalid request ID');
    }
    if (!specialistId || isNaN(Number(specialistId))) {
      throw new BadRequestException('Invalid specialist ID');
    }

    return this.requestsService.assign(+id, +specialistId);
  }

  @Post(':id/feedback')
  async addFeedback(
    @Param('id') requestId: string,
    @Body() dto: any,
  ) {
    const id = parseInt(requestId);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid request ID');
    }

    const { rating, comment, client_name } = dto;

    if (!rating || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    if (!comment || comment.trim().length === 0) {
      throw new BadRequestException('Comment cannot be empty');
    }

    try {
      const result = await pool.query(
        `INSERT INTO feedback (repair_request_id, rating, comment, client_name, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [id, rating, comment.trim(), (client_name || 'Anonymous').trim()],
      );

      return result.rows[0];
    } catch (error) {
      throw new BadRequestException('Failed to add feedback: ' + error.message);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const allowedRoles = ['Manager', 'Operator', 'Admin'];
    if (!allowedRoles.includes(req.user.role)) {
      throw new BadRequestException('⛔ Only managers can delete requests');
    }

    if (!id || isNaN(Number(id))) {
      throw new BadRequestException('Invalid request ID');
    }

    return this.requestsService.remove(+id, req.user.id);
  }
}
