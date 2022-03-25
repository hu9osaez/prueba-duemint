import { Controller, Get, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { InvoicesService } from './invoices.service';
import { ResponseError, ResponseSuccess } from '../dto/response.dto';
import { IResponse } from '../interfaces/response';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('misc/monthly')
  async groupedByMonth(): Promise<IResponse> {
    try {
      // const invoices = await this.invoicesService.getGroupedByMonth();
      this.logger.info('PRUEBA', null);
      // await this.invoicesService.startQueue();

      return new ResponseSuccess(null);
    } catch (error) {
      return new ResponseError(error);
    }
  }
}
