import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { HttpService } from '@nestjs/axios';
import { AssignTaskDto, CreateTaskDto, UpdateTaskDto } from './dto';
import { firstValueFrom } from 'rxjs';

const logger = new Logger('Task-service');

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly httpService: HttpService,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const { title, description } = createTaskDto;

    try {
      const task = this.taskRepository.create({
        title,
        description,
      });

      await this.taskRepository.save(task);

      return {
        ...task,
      };
    } catch (error) {
      logger.error(error.message);
      throw new RpcException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const totalPage = await this.taskRepository.count({
      where: { isActive: true },
    });
    const lastPage = Math.ceil(totalPage / limit);
    try {
      return {
        data: await this.taskRepository.find({
          take: limit,
          skip: (page - 1) * limit,
          where: {
            isActive: true,
          },
        }),
        meta: {
          total: totalPage,
          page: page,
          lastPage: lastPage,
        },
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });

    if (!task) {
      logger.error(`Task not found with id ${id}`);
      throw new RpcException({
        message: `Task not found with id ${id}`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    if (updateTaskDto.userId) {
      logger.error(`Can't update userId`);
      throw new RpcException({
        message: `Can't update userId`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const task = await this.taskRepository.preload({
      id,
      ...updateTaskDto,
    });

    if (!task) {
      logger.error(`Task not found with id ${id}`);
      throw new RpcException({
        message: `Task not found with id ${id}`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    try {
      await this.taskRepository.save(task);
    } catch (error) {
      if (error.code === '23505') {
        logger.error(error.detail);
        throw new RpcException({
          message: error.detail,
          status: HttpStatus.BAD_REQUEST,
        });
      }
    }
    return task;
  }

  async softDeleteTask(id: string) {
    const task = await this.findOne(id);

    if (!task) {
      logger.error(`Task not found with id ${id}`);
      throw new RpcException({
        message: `Task not found with id ${id}`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    task.isActive = false;
    const deletedTask = await this.taskRepository.save(task);

    return deletedTask;
  }

  async assignTask(taskId: string, userId: string) {
    const task = await this.findOne(taskId);

    if (!task) {
      logger.error(`Task not found with id ${taskId}`);
      throw new RpcException({
        message: `Task not found with id ${taskId}`,
        status: HttpStatus.NOT_FOUND,
      });
    }
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:3000/api/users/${userId}`),
      );

      const user = response.data;

      const idToInsert = user.id;
      task.userId = idToInsert;

      const updatedTask = await this.taskRepository.save(task);
      return {
        message: 'Task assigned succesfuly',
        updatedTask,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        logger.error(`User not found with id ${userId}`);
        throw new RpcException({
          message: `User not found with id ${userId}`,
          status: HttpStatus.NOT_FOUND,
        });
      }
      this.handleDBErrors(error);
    }
  }

  async getTasksByUserId(data: {
    userId: string;
    paginationDto: PaginationDto;
  }) {
    const { userId, paginationDto } = data;
    const { page = 1, limit = 10 } = paginationDto;

    try {
      const totalPage = await this.taskRepository.count({
        where: {
          userId,
          isActive: true,
        },
      });

      if (totalPage === 0) {
        logger.error(`This user doesn't have any tasks yet`);
        return {
          message: `This user doesn't have any tasks yet`,
          status: HttpStatus.BAD_REQUEST,
        };
      }

      const lastPage = Math.ceil(totalPage / limit);

      await firstValueFrom(
        this.httpService.get(`http://localhost:3000/api/users/${userId}`),
      );

      const tasks = await this.taskRepository.find({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          userId,
          isActive: true,
        },
      });

      return {
        data: tasks,
        meta: {
          total: totalPage,
          page: page,
          lastPage: lastPage,
        },
      };
    } catch (error) {
      if (error.response?.status === 404) {
        logger.error(`User not found with id ${userId}`);
        throw new RpcException({
          message: `User not found with id ${userId}`,
          status: HttpStatus.NOT_FOUND,
        });
      }
      this.handleDBErrors(error);
    }
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      logger.error(`Conflict error: ${error.message}`);
      throw new ConflictException('Conflict e');
    }

    if (error instanceof NotFoundException) {
      logger.error(`Resource not found: ${error.message}`);
      throw new NotFoundException('Not found');
    }

    logger.error(`Database error: ${error.message}`);
    throw new InternalServerErrorException('Internal server error');
  }
}
