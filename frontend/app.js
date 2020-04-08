const socket = io('http://localhost:3000');

function sendMsg(message) {
  socket.emit('message', message);
}

// After 3s, send a message
setTimeout(() => {
  sendMsg('Hello World');
}, 3000);

// Listen to new messages
socket.on('message', function (data) {
  console.log('Message received from socket', data);
});
