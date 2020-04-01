import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerModule } from './players/player.module';

@Module({
  imports: [
    // The config module will load env variables from .env
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(),
    // Include modules
    PlayerModule,
  ],
})
export class AppModule {}
