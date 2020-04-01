import { PlayerService } from './PlayerService';

export class PlayerController {
  constructor(private readonly service: PlayerService) {}

  index() {
    return this.service.getPlayers();
  }
}
