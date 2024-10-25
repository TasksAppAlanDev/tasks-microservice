import { IsUUID } from 'class-validator';
import { TaskState } from 'src/common/enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  userId: string;

  @Column('text', { nullable: false })
  title: string;

  @Column('text', { nullable: false })
  description: string;

  @Column('enum', {
    enum: TaskState,
    nullable: false,
    default: TaskState.pending,
  })
  state: TaskState;

  @Column('boolean', {
    nullable: false,
    default: true,
  })
  isActive: boolean;
}
