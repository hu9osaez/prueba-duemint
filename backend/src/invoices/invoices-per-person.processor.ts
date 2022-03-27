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
import { IDataByPerson } from '../interfaces/data-by-person.interface';

@Injectable()
@Processor('invoices/stats-per-person')
export class InvoicesPerPersonProcessor {
  private readonly KEY_STATS: string;
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel('Invoice') private readonly invoiceModel: Model<IInvoice | IDataByMonth>,
    @InjectModel('StatsPerPerson') private readonly statsModel: Model<IDataByPerson>,
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.KEY_STATS = 'invoices/tmp-stats-per-person';
  }

  @Process()
  async processStats(job: Job, cb: DoneCallback) {
    const data: JobData = job.data;
    const query = this.parseQuery(data.to, data.from);
    const tmpStats: any = await this.redis.get(this.KEY_STATS);
    const auxTmpStats = {};

    const chunkedData = await this.invoiceModel.aggregate(query).exec();

    if (tmpStats) {
      const parsedStats = JSON.parse(tmpStats);

      chunkedData.forEach((item) => {
        const [year, month] = item.parsedDate.split('-');

        if (has(parsedStats, item.person)) {
          const prevSalesCount: number = get(
            parsedStats,
            `${item.person}.years.${year}.months.${month}.salesCount`,
          );
          const newSalesCount: number = prevSalesCount + item.salesCount;

          const prevTotal: number = get(
            parsedStats,
            `${item.person}.years.${year}.months.${month}.total`,
          );
          const newTotal: number = prevTotal + item.total;

          set(
            auxTmpStats,
            `${item.person}.years.${year}.months.${month}.salesCount`,
            newSalesCount,
          );
          set(auxTmpStats, `${item.person}.years.${year}.months.${month}.total`, newTotal);
        }
      });
    } else {
      chunkedData.forEach((item) => {
        const [year, month] = item.parsedDate.split('-');

        set(
          auxTmpStats,
          `${item.person}.years.${year}.months.${month}.salesCount`,
          item.salesCount,
        );
        set(auxTmpStats, `${item.person}.years.${year}.months.${month}.total`, item.total);
      });
    }

    // Save temporary processed data
    await this.redis.set(this.KEY_STATS, JSON.stringify(auxTmpStats));

    // If is it the last page, we save data to mongo and remove from cache
    if (data.current_page === data.last_page) {
      // Save to mongo
      await this.saveStats(auxTmpStats);

      // Remove data from redis
      await this.redis.del(this.KEY_STATS);

      console.log(
        'All stats from invoices per person were saved in MongoDB collection: [stats-per-person]',
      );
    }

    cb();
  }

  @OnQueueCompleted()
  onCompleteJob(job: Job) {
    const data: JobData = job.data;
    console.info(`Datos procesados: ${data.current_page} de ${data.last_page}`);
  }

  private async saveStats(auxTmpStats) {
    const mapper = async (person) => {
      const years = get(auxTmpStats, `${person}.years`);
      const resultUpdate = await this.statsModel.findOneAndUpdate(
        { person: person.toString() },
        { $set: { years } },
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
            person: '$person',
            parsedDate: {
              $concat: [{ $toString: '$year' }, '-', { $toString: '$month' }],
            },
          },
          salesCount: { $sum: 1 },
          total: { $sum: '$value' },
        },
      },
      {
        $project: {
          _id: 0,
          person: '$_id.person',
          parsedDate: '$_id.parsedDate',
          salesCount: 1,
          total: 1,
        },
      },
    ];
  }
}
