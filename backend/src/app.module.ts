import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [DbModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
