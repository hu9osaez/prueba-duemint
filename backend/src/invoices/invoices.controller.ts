import { Controller, Get, Inject, Query } from '@nestjs/common';
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
  async groupedByMonth(@Query('year') year: string): Promise<IResponse> {
    try {
      const stats = (await this.invoicesService.getOne(year)).toObject();

      return new ResponseSuccess(stats);
    } catch (error) {
      return new ResponseError(error);
    }
  }

  @Get('misc/metadata')
  async getStatsMetadata() {
    try {
      const metadata = await this.invoicesService.getYearStatsMetadata();

      return new ResponseSuccess(metadata);
    } catch (error) {
      return new ResponseError(error);
    }
  }
}
