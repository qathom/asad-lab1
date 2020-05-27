import * as express from 'express';
import * as path from 'path';
import { Request, Response } from 'express';
import { Controller } from './app/Controller'
import { ClientInitData,ClientAccountData,  ClientBetData, VerifyTokenData } from 'types';

// Prepare env variables
require('dotenv').config();

// Throw error if secret is not set
if (!process.env.JWT_SECRET) {
  throw new Error('Please set JWT_SECRET in .env');
}

// Set app
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

  /**
   * Verifies if the token is valid
   */
  socket.on('authenticate', (data: VerifyTokenData) => {
    try {
      const player = controller.verifyPlayer(data.token);

      // Returns data related to the authenticated player
      socket.emit('authenticated', player);

      // Notify clients
      io.sockets.emit('playerJoin', { 
        players: controller.getPlayers(),
      });
    } catch (e) {
      socket.emit('unauthorized');

      console.error('Error while verifying user', e);
    }
  });

  socket.on('init', (data: ClientInitData) => {
    const { canLogin, token } = controller.loginPlayer(data.playerId, data.playerPassword);

    // Init response for target client
    socket.emit('init', { 
      canLogin,
      token,
    });

    // send state to the client
    socket.emit('state', controller.getState())

    if (canLogin) {

      socket.playerId = data.playerId; // bind userid to socket

      // Emit to all clients
      io.sockets.emit('playerJoin', { 
        players: controller.getPlayers(),
      });
    }

    // user disconnected
    socket.on('disconnect', () => {
      const playerId = socket.playerId
      controller.removeBets(playerId)

    });
  });
  
  socket.on('createAccount', (data: ClientAccountData) => {
     const canSubscribe = controller.subscribePlayer(data.playerId, data.playerPassword, data.playerBalance);

    // Init response for target client
    socket.emit('createAccount', { 
      canSubscribe,
    });

    // send state to the client
    socket.emit('state', controller.getState())
  });

  socket.on('bet', (data: ClientBetData) => {
    console.log('ON BET', data);

    try {
      const player = controller.verifyPlayer(data.token);
      const result:any = controller.bet(data.betType, data.cell, data.amount, player.id)

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
    } catch (e) {
      socket.emit('unauthorized');

      console.error('Unverified player during bet');
    }
  });
});


// start controller
controller.setIO(io)
controller.openTable()



// Listen to port 3000
const server = http.listen(3000, () => {
  console.log('listening on *:3000');
});
