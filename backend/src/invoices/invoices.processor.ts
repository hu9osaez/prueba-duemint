import { Injectable } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { DoneCallback, Job } from 'bull';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

import { JobData } from './invoices.service';
import { IInvoice } from '../interfaces/invoice.interface';
import { IDataByMonth } from '../interfaces/data-by-month.interface';

@Injectable()
@Processor('invoices/process-stats')
export class InvoicesProcessor {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel('Invoice') private readonly invoiceModel: Model<IInvoice | IDataByMonth>,
    @InjectRedis() private readonly client: Redis,
  ) {}

  @Process()
  async processStats(job: Job, cb: DoneCallback) {
    const data: JobData = job.data;
    const query = this.parseQuery(data.to, data.from);
    const tmpStats = await this.client.get('invoices/tmp-stats');

    const r = await this.invoiceModel.aggregate(query).exec();
    // const result = this.connection.db.collection('invoices').aggregate(query);
    console.log(query);
    console.log(r);
    cb();
  }

  private parseQuery(limit: number, skip: number) {
    return [
      { $limit: limit },
      { $skip: skip },
      {
        $addFields: {
          year: {
            $toInt: {
              $substr: [{ $toString: '$date' }, 0, 4],
            },
          },
        },
      },
      {
        $group: {
          _id: '$year',
          sales_count: { $sum: 1 },
          total: { $sum: '$value' },
        },
      },
    ];
  }
}
