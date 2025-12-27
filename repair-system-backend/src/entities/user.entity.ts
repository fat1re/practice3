import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from './comment.entity';
import { RepairRequest } from './repair-request.entity';

export type UserRole = 'Manager' | 'Specialist' | 'Operator' | 'Customer' | 'QualityManager';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  fio: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  login: string;

  @Column({ type: 'text' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 30 })
  role: UserRole;

  @OneToMany(() => RepairRequest, (r) => r.master)
  asMaster: RepairRequest[];

  @OneToMany(() => RepairRequest, (r) => r.client)
  asClient: RepairRequest[];

  @OneToMany(() => Comment, (c) => c.master)
  comments: Comment[];
}