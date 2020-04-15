import * as express from 'express';
import * as socketio from 'socket.io';
import * as path from 'path';
import { Request, Response } from 'express';
import { Controller } from './app/Controller'
import { BetType } from './app/utils/BetType';

const app = express();
const controller = new Controller()

// var cookieParser = require('cookie-parser');
// var session = require('express-session')
// app.use(cookieParser());
// app.use(session({
//     secret: '34SDgsdgspxxxxxxxdfsG', // just a long random string
// }));

app.set('port', process.env.PORT || 3000);

let http = require('http').Server(app);

// Set up socket.io and bind it to our http server
let io = require('socket.io')(http);

// Serve frontend
app.get('/', (req: Request, res: Response) => {
  // console.log(req.session.id)
  
  console.log("CanBet: "+controller.bet(BetType.ODD,null,100,"test"))
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

  socket.on('message', (message: any) => {
    console.log(message);

    // echo the message back down the websocket connection
    socket.emit('message', `Well received: ${message}`);
  });
});

// Listen to port 3000
const server = http.listen(3000, () => {
  console.log('listening on *:3000');
});
