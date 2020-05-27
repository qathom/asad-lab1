import { Bet } from './Bet'
import { Player } from './Player'
import { BetType } from './utils/BetType'

export class Board {
    cellBet : Array<Bet>
    colorBet : Array<Bet>   // [0] is red and [1] is black
    oddEvenBet : Array<Bet> // [0] is odd and [1] is even

    constructor() {
        this.cellBet = new Array<Bet>(37)
        this.colorBet = new Array<Bet>(2)
        this.oddEvenBet = new Array<Bet>(2)
    }

    betCell(cell:number, bet: Bet):boolean{
        if (this.cellBet[cell] != undefined && this.cellBet[cell] != null){
            if (this.cellBet[cell].player.id == bet.player.id){
                bet.player.currentAmountBetted -= this.cellBet[cell].amount
                this.cellBet[cell] = undefined
            }
            return false
        }

        this.cellBet[cell] = bet
        return true
    }

    betOddEven(isOdd:boolean, bet: Bet):boolean{
        if (this.oddEvenBet[+!isOdd] != undefined && this.oddEvenBet[+!isOdd] != null){
            if (this.oddEvenBet[+!isOdd].player.id == bet.player.id){
                bet.player.currentAmountBetted -= this.cellBet[+!isOdd].amount
                this.oddEvenBet[+!isOdd] = undefined
            }
            return false
        }

        this.oddEvenBet[+!isOdd] = bet
        return true
    }
    
    betColor(isRed:boolean, bet: Bet):boolean{
        if (this.colorBet[+!isRed] != undefined && this.colorBet[+!isRed] != null){
            if (this.colorBet[+!isRed].player.id == bet.player.id){
                bet.player.currentAmountBetted -= this.cellBet[+!isRed].amount
                this.colorBet[+!isRed] = undefined
            }
            return false
        }
        this.colorBet[+!isRed] = bet
        return true
    }

    cellWinner(selectedCell:number):Bet{
        return this.cellBet[selectedCell]
    }

    oddEvenWinner(isOdd:boolean):Bet{
        return this.oddEvenBet[+!isOdd]
    }

    colorWinner(isRed:boolean):Bet{
        return this.colorBet[+!isRed]
    }

    removeBets(playerId:String){
        console.log(playerId, "bets removed")

        let id = this.cellBet.findIndex(bet => {bet.player.id === playerId})
        if (id > -1) this.cellBet[id] = undefined
        id = this.colorBet.findIndex(bet => {bet.player.id === playerId})
        if (id > -1) this.colorBet[id] = undefined
        id = this.oddEvenBet.findIndex(bet => {bet.player.id === playerId})
        if (id > -1) this.oddEvenBet[id] = undefined
    }

    reset(){
        this.cellBet = new Array<Bet>(37)
        this.colorBet = new Array<Bet>(2)
        this.oddEvenBet = new Array<Bet>(2)
    }
}
