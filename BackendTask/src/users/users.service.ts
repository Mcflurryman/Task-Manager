import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';



// This should be a real class/interface representing a user entity
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}


  async findOne(email: string) {
    return this.prisma.user.findUnique({
        where: { email },
    })
  }
  create(createUserDto: CreateUserDto){
    return this.prisma.user.create({
        data: createUserDto,
    });
  }
   findAll() {
    return this.prisma.user.findMany();
  }
}