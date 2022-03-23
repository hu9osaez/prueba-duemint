import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ApiModule } from './api.module';

import { checkConfig } from './shared/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      validate: checkConfig,
    }),
    ApiModule,
  ],
})
export class AppModule {}
