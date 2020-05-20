import { Player } from './Player';
const fs = require('fs');
const md5= require('md5')


// relative path in backend
const DATA_URL = 'data/players.json'


export class PlayerAuth {

    constructor() {
        console.log("auth constructor")
    }

    getPlayers(){

        let rawdata = fs.readFileSync(DATA_URL);
        let playersJSON = JSON.parse(rawdata);
        return playersJSON
    }

    savePlayers(players: Object){
        let data = JSON.stringify(players);
        fs.writeFileSync(DATA_URL, data) ;
    }

    subscribePlayer(player: Player):boolean{
        let players = this.getPlayers()
        for(let idx in players) {
            let playerJSON = players[idx]
            if(playerJSON.id == player.id) {
                return false
            }
        }

        // user doesnt exists
        let newPlayerJSON = {"id": player.id, "password": md5(player.password), "bank": player.bank}
        players.push(newPlayerJSON)
        this.savePlayers(players)

        return true;
    }

    checklogin(pid: string, password:string):Player {
       let players = this.getPlayers()
       for(let idx in players) {
            let playerJSON = players[idx]
            if(pid == playerJSON.id && md5(password) == playerJSON.password ) {
                return new Player(pid, password, playerJSON.bank)
            }
        }

        return null
    }
}
  