import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shift } from './shift.entity';
import { User } from '../../users/entities/user.entity';

@Entity('shift_applications')
export class ShiftApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shift_id' })
  shiftId: string;

  @ManyToOne(() => Shift, (shift) => shift.applications)
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 1 })
  priority: number;

  @Column({ default: 'pending' })
  status: string; // pending, approved, rejected

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'applied_at' })
  appliedAt: Date;
}
