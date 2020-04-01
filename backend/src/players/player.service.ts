import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerEntity } from './player.entity';

@Injectable()
export class PlayerService {
  constructor (@InjectRepository(PlayerEntity) private readonly repository: Repository<PlayerEntity>) {}

  async getPlayers(): Promise<PlayerEntity[]> {
    return this.repository.find();
  }
}