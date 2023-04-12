import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventGateway } from './events.gateway';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [UsersModule, MongooseModule.forRoot('mongodb://localhost/socketDemo')],
  controllers: [AppController],
  providers: [EventGateway, AppService],
})
export class AppModule {}
