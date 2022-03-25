import * as mongoose from 'mongoose';

export const StatsPerMonthSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      index: true,
      required: true,
      unique: true,
    },
    months: Object,
  },
  {
    collection: 'stats-per-month',
  },
);
