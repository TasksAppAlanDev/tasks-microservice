import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { taskSeedData } from './data/seed.data'; 
import { Task } from 'src/tasks/entities';

const logger = new Logger('SeedService');

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async seed() {

    await this.taskRepository.clear();


    const saveTasksPromises = taskSeedData.map(async (taskData) => {
      const task = this.taskRepository.create({
        ...taskData,
        isActive: true,
      });
      return this.taskRepository.save(task);
    });

    try {
      const savedTasks = await Promise.all(saveTasksPromises);
      return { message: 'Tasks seeded successfully', count: savedTasks.length };
    } catch (error) {
      logger.error('Error seeding tasks: ', error.message);
      throw new InternalServerErrorException('Failed to seed tasks');
    }
  }
}
