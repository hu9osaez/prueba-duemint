import { Injectable } from '@nestjs/common';
import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { DoneCallback, Job } from 'bull';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { get, set, has } from 'dot-prop';
import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import * as pMap from 'p-map';

import { JobData } from './invoices.service';
import { IInvoice } from '../interfaces/invoice.interface';
import { IDataByMonth } from '../interfaces/data-by-month.interface';

@Injectable()
@Processor('invoices/process-stats')
export class InvoicesProcessor {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel('Invoice') private readonly invoiceModel: Model<IInvoice | IDataByMonth>,
    @InjectModel('StatsPerMonth') private readonly statsModel: Model<IDataByMonth>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Process()
  async processStats(job: Job, cb: DoneCallback) {
    const data: JobData = job.data;
    const query = this.parseQuery(data.to, data.from);
    const tmpStats: any = await this.redis.get('invoices/tmp-stats');
    const auxTmpStats = {};

    const chunkedData = await this.invoiceModel.aggregate(query).exec();

    if (tmpStats) {
      const parsedStats = JSON.parse(tmpStats);

      chunkedData.forEach((item) => {
        const [year, month] = item._id.toString().split('-');

        if (has(parsedStats, year)) {
          const newSalesCount: number =
            get(parsedStats, `${year}.months.${month}.sales_count`) + item.sales_count;
          const newTotal: number = get(parsedStats, `${year}.months.${month}.total`) + item.total;

          set(auxTmpStats, `${year}.months.${month}.sales_count`, newSalesCount);
          set(auxTmpStats, `${year}.months.${month}.total`, newTotal);
        }
      });
    } else {
      chunkedData.forEach((item) => {
        const [year, month] = item._id.toString().split('-');

        set(auxTmpStats, `${year}.months.${month}.sales_count`, item.sales_count);
        set(auxTmpStats, `${year}.months.${month}.total`, item.total);
      });
    }

    // Save temporary processed data
    await this.redis.set('invoices/tmp-stats', JSON.stringify(auxTmpStats));

    // If is it the last page, we save data to mongo and remove from cache
    if (data.current_page === data.last_page) {
      // Save to mongo
      await this.saveStats(auxTmpStats);

      // Remove data from redis
      await this.redis.del('invoices/tmp-stats');

      console.log('All stats from invoices were saved in MongoDB collection: [stats-per-month]');
    }

    cb();
  }

  @OnQueueCompleted()
  onCompleteJob(job: Job) {
    const data: JobData = job.data;
    console.info(`Datos procesados: ${data.current_page} de ${data.last_page}`);
  }

  private async saveStats(auxTmpStats) {
    const mapper = async (year) => {
      const months = get(auxTmpStats, `${year}.months`);
      const resultUpdate = await this.statsModel.findOneAndUpdate(
        { year: year.toString() },
        { $set: { months } },
        { upsert: true },
      );

      return resultUpdate;
    };

    return await pMap(Object.keys(auxTmpStats), mapper, { concurrency: 20 });
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
          month: {
            $month: {
              $toDate: { $toString: '$date' },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            $concat: [{ $toString: '$year' }, '-', { $toString: '$month' }],
          },
          sales_count: { $sum: 1 },
          total: { $sum: '$value' },
        },
      },
    ];
  }
}
