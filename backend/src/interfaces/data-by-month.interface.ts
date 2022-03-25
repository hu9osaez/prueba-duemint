import { Document } from 'mongoose';

export interface IDataByMonth extends Document {
  year: string;
  months: any;
}
