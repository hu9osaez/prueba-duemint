import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';

import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { InvoicesPerYearMonthProcessor } from './invoices-per-year-month.processor';
import { InvoicesPerPersonProcessor } from './invoices-per-person.processor';

import { InvoiceSchema } from '../schemas/invoice.schema';
import { StatsPerMonthSchema } from '../schemas/stats-per-month.schema';
import { StatsPerPersonSchema } from '../schemas/stats-per-person.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Invoice', schema: InvoiceSchema },
      { name: 'StatsPerMonth', schema: StatsPerMonthSchema },
      { name: 'StatsPerPerson', schema: StatsPerPersonSchema },
    ]),
    BullModule.registerQueue({
      name: 'invoices/stats-per-year-month',
    }),
    BullModule.registerQueue({
      name: 'invoices/stats-per-person',
    }),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesPerYearMonthProcessor, InvoicesPerPersonProcessor, InvoicesService],
})
export class InvoicesModule {}
