import {Board} from './Board'
import { BetType } from './utils/BetType';
import { GameStateType } from './utils/GameStateType';
import { Bet } from './Bet';
import { Player } from './Player';
import { CellUtils } from './utils/CellUtils';
import { PlayerAuth } from './PlayerAuth'
import * as jwt from 'jsonwebtoken';

export class Controller {
  board: Board;
  gameState: GameStateType;
  io:any;
  playerAuth: PlayerAuth

  players: Map<string, Player>;

  constructor() {
    this.board = new Board();
    this.players = new Map();
    this.playerAuth = new PlayerAuth();

    // Add list of player objects returned by PlayerAuth
    this.playerAuth.findAll().forEach((player) => {
      this.players.set(player.id, new Player(player.id, player.password, player.bank));
    });
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
        this.io.emit('number', num);
        this.io.emit('state', this.gameState);

        let winners = this.computeWinners(num);
        console.log("winners", winners);
        this.io.emit('results', {
          winners: Array.from(winners.keys())
        });

        // new round
        setTimeout(()=>{this.openTable()},1000);

      },2000)
    },10000)
  }

  subscribePlayer(playerId: string, password:string, balance: number): boolean {
    const player: Player = new Player(playerId, password, balance)
    const cansub = this.playerAuth.subscribe(player);

    if (cansub) {
      this.players.set(playerId, player);
    }

    return cansub
  }

  loginPlayer(pid:string, password:string): { canLogin: boolean, token: string|null } {
    const player:Player|null = this.playerAuth.login(pid, password);

    if (player === null) {
      return { canLogin: false, token: null };
    }
    
    this.players.set(pid, player);

    const token = jwt.sign({
      player,
    }, process.env.JWT_SECRET, { expiresIn: '24h' });

    return { token, canLogin: true };
  }

  verifyPlayer(token: string): Player {
    try {
      const { player } = jwt.verify(token, process.env.JWT_SECRET);
      return player;
    } catch (err) {
      throw err;
    }
  }

  removeBets(playerId: string){
    this.board.removeBets(playerId)
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  bet(betType: BetType, cell: number, amount: number, playerId: string) : any {
    let status = false
    const player : Player = this.players.get(playerId)
    const bet : Bet = new Bet(amount, player)

    if(this.gameState != GameStateType.OPEN) {
      console.log("cannot bet now");
      return {player, status}
    }

    if (!player.canBet(amount))
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

    // TODO REMOVE
    // if(status)
    //   bet.player.bank -= amount
    if(status)
      bet.player.currentAmountBetted += amount

    return {player,status}
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

    for(let [key, player] of this.players) {
      player.bank -= player.currentAmountBetted
      player.currentAmountBetted = 0
    }

    this.board.reset()
    return winners
  }
}
