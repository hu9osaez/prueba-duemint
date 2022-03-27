import { Document } from 'mongoose';

export interface IDataByPerson extends Document {
  person: string;
  years: any;
}
