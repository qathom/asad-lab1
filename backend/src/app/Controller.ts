import {Board} from './Board'
import { BetType } from './utils/BetType';
import { Bet } from './Bet';
import { Player } from './Player';

export class Controller {
    board : Board
    constructor() {
        this.board = new Board()
    }

    subscribePlayer(){

    }

    bet(betType: BetType, cell:number, amount:number, playerId:String){
        let status = false
        switch(betType) {
            case BetType.CELL: {
                status = this.board.betCell(cell, new Bet(amount, new Player(playerId)))
                break
            }
            case BetType.ODD: {
                status = this.board.betOddEven(true, new Bet(amount, new Player(playerId)))
                break
            }
            case BetType.EVEN: {
                status = this.board.betOddEven(false, new Bet(amount, new Player(playerId)))
                break
            }
            case BetType.RED: {
                status = this.board.betColor(true, new Bet(amount, new Player(playerId)))
                break
            }
            case BetType.BLACK: {
                status = this.board.betColor(false, new Bet(amount, new Player(playerId)))
                break
            }
        }
        return status
    }

    process(){

    }

    computeWinners(){

    }
}
