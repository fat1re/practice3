import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { User } from './user.entity';

@Entity('repair_requests')
export class RepairRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  number: string;

  @CreateDateColumn({ type: 'timestamp' })
  dateAdded: Date;

  @Column({ type: 'varchar', length: 100, name: 'climate_tech_type' })
  climateTechType: string;

  @Column({ type: 'varchar', length: 200, name: 'climate_tech_model' })
  climateTechModel: string;

  @Column({ type: 'text', name: 'problem_description' })
  problemDescription: string;

  @Column({ type: 'varchar', length: 50, default: 'Открыта', name: 'request_status' })
  requestStatus: string;

  @Column({ type: 'timestamp', nullable: true, name: 'completion_date' })
  completionDate: Date | null;

  @Column({ type: 'text', nullable: true, name: 'repair_parts' })
  repairParts: string | null;

  @ManyToOne(() => User, (u) => u.asMaster, { nullable: true })
  @JoinColumn({ name: 'master_id' })
  master: User | null;

  @ManyToOne(() => User, (u) => u.asClient, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @OneToMany(() => Comment, (c) => c.request, { cascade: true })
  comments: Comment[];
}
