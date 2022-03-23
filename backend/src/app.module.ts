import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api.module';

import { checkConfig } from './shared/env.validation';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      cache: true,
      validate: checkConfig,
    }),
    ApiModule,
  ],
})
export class AppModule {}
