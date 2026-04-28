import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findByAssignedUser(userId: number) {
    return this.prisma.task.findMany({
      where: {
        assignedToId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
