import {Board} from './Board'
import { BetType } from './utils/BetType';
import { GameStateType } from './utils/GameStateType';
import { Bet } from './Bet';
import { Player } from './Player';
import { CellUtils } from './utils/CellUtils';

export class Controller {
  board: Board;
  gameState: GameStateType;
  io:any;

  // @TODO : keep?
  players: Map<string, Player>;

  requiredNumberPlayers: number = 1;

  constructor() {
    this.board = new Board();
    this.players = new Map();
  }

  getState() {
    return this.gameState;
  }

  setIO(io:any) {
    this.io = io;
  }
 
  openTable() {

    console.log("[NEW TURN] - place your bets")
    this.gameState = GameStateType.OPEN;
    this.io.emit('state', this.gameState);

    setTimeout(()=>{

      console.log("[NO MORE BETS]");
      this.gameState = GameStateType.NO_MORE_BETS;
      this.io.emit('state', this.gameState);


      setTimeout(()=>{

        // new random number
        let num:number = Math.round(Math.random() * 36);
        console.log("[NUMBER SELECTED]", num);
        this.gameState = GameStateType.RESULT;
        this.io.emit('state', this.gameState);

        let winners = this.computeWinners(num);
        console.log("winners", winners);

        // new round
        setTimeout(()=>{this.openTable()},1000);

      },2000)
    },10000)
  }

  subscribePlayer(playerId: string): boolean {
    // Unique players check
    if (this.players.has(playerId)) {
      return false;
    }

    this.players.set(playerId, new Player(playerId));

    return true;
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  canStartGame(): boolean {
    return this.players.size === this.requiredNumberPlayers;
  }

  bet(betType: BetType, cell:number, amount:number, playerId: string) : any {


    let status = false
    const player : Player = this.players.get(playerId)
    const bet : Bet = new Bet(amount, player)

    if(this.gameState != GameState.OPEN) {
      return {player, status}
    }

    if (player.bank < amount)
      return {player,status}

    switch(betType) {
      case BetType.CELL: {
        status = this.board.betCell(cell, bet);
        break
      }
      case BetType.ODD: {
        status = this.board.betOddEven(true, bet);
        break
      }
      case BetType.EVEN: {
        status = this.board.betOddEven(false, bet);
        break
      }
      case BetType.RED: {
        status = this.board.betColor(true, bet);
        break
      }
      case BetType.BLACK: {
        status = this.board.betColor(false, bet);
        break
      }
    }

    if(status)
      bet.player.bank -= amount

    return {player,status}
  }

  process(){

  }

  computeWinners(selectedCell:number):Map<Player,number>{
    const winners : Map<Player,number> = new Map()

    // COLOR WINNER
    if (selectedCell != 0){
      let colorWinner : Bet = this.board.colorWinner(CellUtils.isRed(selectedCell))
      if (colorWinner != null && colorWinner != undefined)
        winners.set(colorWinner.player, colorWinner.amount * CellUtils.COLOR_MULTIPLIER)
    }

    // ODD EVEN WINNER
    let oldWinnerAmount : number = 0
    let oddEvenWinner : Bet = this.board.oddEvenWinner(selectedCell%2==1)
    if (oddEvenWinner != null && oddEvenWinner != undefined){
      if (winners.has(oddEvenWinner.player))
        oldWinnerAmount = winners.get(oddEvenWinner.player)
      winners.set(oddEvenWinner.player,  oldWinnerAmount + (oddEvenWinner.amount * CellUtils.ODD_EVEN_MULTIPLIER))
    }

    // CELL WINNER
    oldWinnerAmount = 0
    let cellWinner : Bet = this.board.cellWinner(selectedCell)
    if (cellWinner != null && cellWinner != undefined){
      if (winners.has(cellWinner.player))
        oldWinnerAmount = winners.get(cellWinner.player)
      winners.set(cellWinner.player,  oldWinnerAmount + (cellWinner.amount * CellUtils.CELL_MULTIPLIER))
    }

    for(let winner of winners){
      winner[0].bank += winner[1]
      console.log(winner[0])
    }

    this.board.reset()
    return winners
  }
}