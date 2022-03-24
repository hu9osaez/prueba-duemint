import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IInvoice } from '../interfaces/invoice.interface';
import { IDataByMonth } from '../interfaces/data-by-month.interface';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel('Invoice') private readonly invoiceModel: Model<IInvoice | IDataByMonth>,
  ) {}

  async getGroupedByMonth(): Promise<IDataByMonth[]> {
    return this.invoiceModel.aggregate([
      {
        $group: {
          _id: {
            $toInt: {
              $dateToString: {
                date: '$date',
                format: '%Y%m',
              },
            },
          },
          sales_count: { $sum: 1 },
          total: { $sum: '$value' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}
