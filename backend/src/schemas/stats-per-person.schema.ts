import * as mongoose from 'mongoose';

export const StatsPerPersonSchema = new mongoose.Schema(
  {
    person: {
      type: String,
      index: true,
      required: true,
      unique: true,
    },
    years: Object,
  },
  {
    collection: 'stats-per-person',
  },
);
