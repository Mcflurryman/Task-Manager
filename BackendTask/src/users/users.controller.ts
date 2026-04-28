import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import { JwtAuthGuard } from '../auth/jwt.auth.guards';

type AuthenticatedRequest = {
  user: {
    userId: number;
    email: string;
    role: Role;
    companyId: number | null;
  };
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('employees')
  findEmployees(@Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Solo SUPER_ADMIN puede ver empleados');
    }

    return this.usersService.findEmployees();
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
