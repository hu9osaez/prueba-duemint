import * as mongoose from 'mongoose';

export const InvoiceSchema = new mongoose.Schema({
  date: Date,
  value: Number,
  currency: String,
  person: String,
});
