import { Body, Controller, Get, Post, Put, Param, Delete, } from '@nestjs/common';
import { CompaniesService } from './companies.services';
import { CreateCompanyDto } from './dto/create.company.dto';
import { UpdateCompanyDto } from './dto/update.company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }
  @Put(':id')
update(
  @Param('id') id: string,
  @Body() updateCompanyDto: UpdateCompanyDto,
) {
  return this.companiesService.update(Number(id), updateCompanyDto);
}

}