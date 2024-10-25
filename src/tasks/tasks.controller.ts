import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/asign-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern('createTask')
  create(@Payload() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @MessagePattern('findAllTasks')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.tasksService.findAll(paginationDto);
  }

  @MessagePattern('findTask')
  findOne(@Payload() id: string) {
    return this.tasksService.findOne(id);
  }

  @MessagePattern('updateTask')
  updateTask(@Payload() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(updateTaskDto.id, updateTaskDto);
  }

  //? soft delete para evitar problemas de entidad referencial
  @MessagePattern('softDeleteTask')
  softDeleteTask(@Payload() id: string) {
    return this.tasksService.softDeleteTask(id);
  }

  @MessagePattern('asignTask')
  async assignTask(@Payload() payload: { taskId: string; userId: string }) {
    const { taskId, userId } = payload; 
    return this.tasksService.assignTask(taskId, userId);
  }

  @MessagePattern('getTasksByUserId')
  async getTasksByUserId(@Payload() data: { userId: string; paginationDto: PaginationDto }) {
    return this.tasksService.getTasksByUserId(data);
  }
}
