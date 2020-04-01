var app = require('./http-server.js')
var http = require('http').createServer(app)
var io = require('socket.io')(http)


io.on('connection', function(socket){
  console.log('a user connected')


  // bet from player {enum: type, balance: double}
  socket.on('bet', function(bet){
    console.log('new bet: ' + bet.balance);
  });


  socket.on('disconnect', function(){
    console.log('player disconnected')
  })
})


http.listen(3000, function(){
  console.log('listening on *:3000')
})