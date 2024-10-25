import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TaskState } from 'src/common/enums';

export class CreateTaskDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(TaskState)
  state: TaskState;
}
