import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema()
export class Invoice {
  @Prop()
  value: number;

  @Prop()
  currency: string;

  @Prop()
  date: Date;

  @Prop()
  person: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
