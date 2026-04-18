import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [PrismaModule, TasksModule, CompaniesModule],
})
export class AppModule {}
