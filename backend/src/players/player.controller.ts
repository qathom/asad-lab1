import { Controller, Get } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller()
export class PlayerController {
  constructor(private readonly service: PlayerService) {}

  @Get()
  index() {
    return this.service.getPlayers();
  }
}
