import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { User } from './entities/user.entity';
import { Course } from './entities/course.entity';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { Marks } from './entities/marks.entity';
// Import your entities


@Module({
  imports: [
    // 1. Load environment variables from .env
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available everywhere without re-importing
    }),

    // 2. Configure PostgreSQL Connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'), 
        password: config.get<string>('DB_PASSWORD'), 
        database: config.get<string>('DB_NAME'),
        entities: [User, Course, Quiz, Question, Marks],
        synchronize: true, // Automatically creates tables in the DB (Disable in Prod)
      }),
    }),

    // 3. Configure Redis Connection
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}