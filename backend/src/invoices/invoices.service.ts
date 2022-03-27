import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { InjectConnection } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

import { IDataByMonth } from '../interfaces/data-by-month.interface';

export type JobData = {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
};

@Injectable()
export class InvoicesService implements OnModuleInit {
  private readonly PER_PAGE: number;
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel('StatsPerMonth') private readonly statsModel: Model<IDataByMonth>,
    @InjectQueue('invoices/stats-per-year-month') private statsYearsQueue: Queue,
    @InjectQueue('invoices/stats-per-person') private statsPersonQueue: Queue,
  ) {
    this.PER_PAGE = 500000;
  }

  // Process stats per years & months
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async startStatsYearsQueue() {
    const collectionStats = await this.connection.db.collection('invoices').stats();
    const pagination = this.pagination(collectionStats.count, 1, this.PER_PAGE);

    for (let current = pagination.current_page; current <= pagination.last_page; current++) {
      await this.statsYearsQueue.add(this.pagination(pagination.total, current, this.PER_PAGE));
    }
  }

  // Process stats per person, years & months
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async startStatsPersonQueue() {
    const collectionStats = await this.connection.db.collection('invoices').stats();
    const pagination = this.pagination(collectionStats.count, 1, this.PER_PAGE);

    for (let current = pagination.current_page; current <= pagination.last_page; current++) {
      await this.statsPersonQueue.add(this.pagination(pagination.total, current, this.PER_PAGE));
    }
  }

  // DB related-methods
  async getOne(year: string) {
    return this.statsModel.findOne({ year }).exec();
  }

  async getYearStatsMetadata() {
    return this.statsModel.distinct('year');
  }

  // NestJS
  async onModuleInit(): Promise<void> {
    console.log(`The module has been initialized.`);
    await this.startStatsPersonQueue();
  }

  // Helper
  private pagination(length: number, currentPage: number, itemsPerPage: number): JobData {
    return {
      total: length,
      per_page: itemsPerPage,
      current_page: currentPage,
      last_page: Math.ceil(length / itemsPerPage),
      from: (currentPage - 1) * itemsPerPage + 1,
      to: currentPage * itemsPerPage,
    };
  }
}
