import {Player} from './Player'
export class Bet {
    amount:number
    player:Player

    constructor(amount:number, player:Player) {
        this.amount = amount
        this.player = player
    }
}
  