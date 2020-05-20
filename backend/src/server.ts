import * as express from 'express';
import * as socketio from 'socket.io';
import * as path from 'path';
import { Request, Response } from 'express';
import { Controller } from './app/Controller'
import { BetType } from './app/utils/BetType';
import { ClientInitData, ClientBetData } from 'types';
import { Bet } from './app/Bet';

const app = express();
const controller = new Controller()

app.set('port', process.env.PORT || 3000);

let http = require('http').Server(app);

// Set up socket.io and bind it to our http server
let io = require('socket.io')(http);

// Serve frontend
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.resolve('../frontend/index.html'));
});

// Static assets such as app.js
app.use(express.static(path.resolve('../frontend')));

/*
 * Whenever a user connects on port 3000 via
 * a websocket, log that a user has connected
 */
io.on('connection', (socket: any) => {
  console.log('a user connected');

  // const canBet = controller.bet(BetType.ODD,null,100,"test");

  socket.on('init', (data: ClientInitData) => {
    const canSubscribe = controller.subscribePlayer(data.playerId);

    // Init response for target client
    socket.emit('init', { 
      canSubscribe,
    });

    // send state to the client
    socket.emit('state', controller.getState())

    if (canSubscribe) {
      // Emit to all clients
      io.sockets.emit('playerJoin', { 
        players: controller.getPlayers(),
      });
    }
  });

  socket.on('bet', (data: ClientBetData) => {
    console.log(data)
    let result:any = controller.bet(data.betType,data.cell,data.amount, data.playerId)

    // TEST/DEBUG WINNERS
    //let randomCell = Math.floor(Math.random() * 37)
    //let winners = controller.computeWinners(randomCell)
    //console.log("SelectedCell", randomCell, "winners", winners)


    io.sockets.emit('bet', {
      bet: {
        betType:data.betType,
        cell:data.cell,
        amount:data.amount,
        player:{
          playerId: result.player.id,
          bank: result.player.bank,
          currentAmountBetted: result.player.currentAmountBetted
        },
      },
      status: result.status,
    });
  });
});


// start controller
controller.setIO(io)
controller.openTable()



// Listen to port 3000
const server = http.listen(3000, () => {
  console.log('listening on *:3000');
});
