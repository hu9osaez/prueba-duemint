import { Document } from 'mongoose';

export interface IDataByMonth extends Document {
  _id: number;
  sales_count: number;
  total: number;
}
