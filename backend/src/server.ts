import * as express from 'express';
import * as socketio from 'socket.io';
import * as path from 'path';
import { Request, Response } from 'express';

const app = express();
app.set('port', process.env.PORT || 3000);

let http = require('http').Server(app);

// Set up socket.io and bind it to our http server
let io = require('socket.io')(http);

// Serve frontend
app.get('/', (_req: Request, res: Response) => {
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
