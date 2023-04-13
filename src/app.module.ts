import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventGateway } from './events.gateway';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {DATABASE} from '../env'
@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule, MongooseModule.forRoot(DATABASE)
  ],
  controllers: [AppController],
  providers: [EventGateway, AppService],
})
export class AppModule {}
