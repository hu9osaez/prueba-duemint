import { Document } from 'mongoose';

export interface IInvoice extends Document {
  value: number;
  currency: string;
  date: Date;
  person: string;
}
