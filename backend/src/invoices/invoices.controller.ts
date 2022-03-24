import { Controller, Get } from '@nestjs/common';

import { InvoicesService } from './invoices.service';
import { ResponseError, ResponseSuccess } from '../dto/response.dto';
import { IResponse } from '../interfaces/response';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('misc/monthly')
  async groupedByMonth(): Promise<IResponse> {
    try {
      const invoices = await this.invoicesService.getGroupedByMonth();

      return new ResponseSuccess(invoices);
    } catch (error) {
      return new ResponseError(error);
    }
  }
}
