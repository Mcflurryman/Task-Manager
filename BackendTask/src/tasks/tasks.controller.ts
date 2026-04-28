import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt.auth.guards';
import { TasksService } from './tasks.service';

type AuthenticatedRequest = {
  user: {
    userId: number;
    email: string;
    role: Role;
    companyId: number | null;
  };
};

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findOwnTasks(@Req() req: AuthenticatedRequest) {
    return this.tasksService.findByAssignedUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  findTasksByUser(
    @Req() req: AuthenticatedRequest,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Solo SUPER_ADMIN puede ver tareas de otros usuarios',
      );
    }

    return this.tasksService.findByAssignedUser(userId);
  }
}
