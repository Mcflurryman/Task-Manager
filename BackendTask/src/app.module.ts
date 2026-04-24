import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { CompaniesModule } from '../companies/companies.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    TasksModule,
    CompaniesModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
