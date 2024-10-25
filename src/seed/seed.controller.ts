import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @MessagePattern('seedTasks')
  async seedTasks() {
    return this.seedService.seed();
  }
}
