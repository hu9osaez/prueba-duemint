import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';

import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { InvoicesProcessor } from './invoices.processor';

import { InvoiceSchema } from '../schemas/invoice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Invoice', schema: InvoiceSchema, collection: 'invoices' }]),
    BullModule.registerQueue({
      name: 'invoices/process-stats',
    }),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesProcessor, InvoicesService],
})
export class InvoicesModule {}
