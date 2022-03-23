import { Controller, Get } from '@nestjs/common';

@Controller('invoices')
export class InvoicesController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
