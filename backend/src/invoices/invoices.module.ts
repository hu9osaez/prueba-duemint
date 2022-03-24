import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

import { InvoiceSchema } from '../schemas/invoice.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Invoice', schema: InvoiceSchema }])],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
