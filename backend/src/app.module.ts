import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';

import { ApiModule } from './api.module';

import { checkConfig } from './shared/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      validate: checkConfig,
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
      ],
    }),
    ApiModule,
  ],
})
export class AppModule {}
