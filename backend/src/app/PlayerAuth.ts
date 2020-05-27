import { Player } from './Player';
import * as fs  from 'fs';
import * as md5 from 'md5';

export class PlayerAuth {
  // Relative path in backend
  private readonly storagePath = 'data/players.json';

  findAll(): Player[] {
    const rawdata = fs.readFileSync(this.storagePath, 'utf-8');
    const playersJSON = JSON.parse(rawdata);
    return playersJSON;
  }

  save(players: Player[]) {
    const data = JSON.stringify(players);
    fs.writeFileSync(this.storagePath, data) ;
  }

  subscribe(player: Player): boolean {
    // Player already exists
    const players = this.findAll();

    if (players.findIndex(p => p.id === player.id) > -1) {
      return false;
    }

    // user doesnt exists
    const newPlayer = new Player(
      player.id,
      md5(player.password),
      player.bank,
    );

    players.push(newPlayer);

    this.save(players);

    return true;
  }

  login(pid: string, password:string): Player {
    const players = this.findAll();
    for (let idx in players) {
      let playerJSON = players[idx]
      const md5sum = md5(password);

      if(pid == playerJSON.id && md5sum == playerJSON.password ) {
          return new Player(pid, password, playerJSON.bank);
      }
    }

    return null;
  }
}
