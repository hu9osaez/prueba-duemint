import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { InjectConnection } from '@nestjs/mongoose';

import { IInvoice } from '../interfaces/invoice.interface';
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
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel('Invoice') private readonly invoiceModel: Model<IInvoice | IDataByMonth>,
    @InjectQueue('invoices/process-stats') private statsQueue: Queue,
  ) {}

  async startQueue() {
    const perPage = 1000000;
    const collectionStats = await this.connection.db.collection('invoices').stats();
    const pagination = this.pagination(collectionStats.count, 1, perPage);

    for (let current = pagination.current_page; current <= pagination.last_page; current++) {
      await this.statsQueue.add(this.pagination(pagination.total, current, perPage));
    }
  }

  async onModuleInit(): Promise<void> {
    console.log(`The module has been initialized.`);
    await this.startQueue();
  }

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
