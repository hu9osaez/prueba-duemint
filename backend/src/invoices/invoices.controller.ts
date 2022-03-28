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

  @Get('stats/monthly')
  async groupedByYear(@Query('year') year: string): Promise<IResponse> {
    try {
      const stats = (await this.invoicesService.getOneYear(year)).toObject();

      return new ResponseSuccess(stats);
    } catch (error) {
      return new ResponseError(error);
    }
  }

  @Get('stats/per-person')
  async groupedByPerson(
    @Query('person') person: string,
    @Query('year') year: string,
  ): Promise<IResponse> {
    try {
      const stats = (await this.invoicesService.getOnePerson(year, person)).toObject();

      return new ResponseSuccess(stats);
    } catch (error) {
      return new ResponseError(error);
    }
  }

  @Get('stats/metadata/years')
  async getStatsMetadata() {
    try {
      const metadata = await this.invoicesService.getYearStatsMetadata();

      return new ResponseSuccess(metadata);
    } catch (error) {
      return new ResponseError(error);
    }
  }
}
