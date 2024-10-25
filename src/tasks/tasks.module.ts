import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [TasksController],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Task]),
    HttpModule
  ],
  providers: [TasksService],
  exports: [TypeOrmModule]
})
export class TasksModule {}
