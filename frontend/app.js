const socket = io('http://localhost:3000');

function startGame(players) {
  // Show the game container
  if (document.querySelector('#gameContainer').classList.contains('d-none')) {
    document.querySelector('#gameContainer').classList.remove('d-none');
  }

  // Remove the init modal
  if (document.querySelector('#initModal').classList.contains('show')) {
    $('#initModal').modal('hide');
  }

  // Remove the wait modal
  if (document.querySelector('#waitModal').classList.contains('show')) {
    $('#waitModal').modal('hide');
  }

  // Display the list of players
  const playerContainer = document.querySelector('#players');
  const ul = document.createElement('ul');

  players.forEach(function (player) {
    const item = document.createElement('li');
    item.innerHTML = player.id;

    ul.appendChild(item);
  });

  playerContainer.innerHTML = '';
  playerContainer.appendChild(ul);

  // Board
  document.querySelector('#tableRoulette').addEventListener('click', function (event) {
    const target = event.target.nodeName === 'TD' ? event.target.querySelector('span') : event.target;

    if (!target) {
      return;
    }

    const value = parseInt(target.innerHTML, 10);

    if (isNaN(value)) {
      return;
    }

    console.log('BET', value);

    socket.emit('bet', { value })
  });
}

function initApp() {
  // Show the modal
  $('#initModal').modal({ backdrop: 'static', keyboard: false });
  $('#initModal').modal('show');

  document.querySelector('#playButton').addEventListener('click', function () {
    const playerId = document.querySelector('#inputPlayerName').value;
    socket.emit('init', { playerId });
  });
}

// Listeners
socket.on('init', function (data) {
  const playerInput = document.querySelector('#inputPlayerName');
 
  console.log(data);

  if (!data.canSubscribe) {
    if (!playerInput.classList.contains('is-invalid')) {
      playerInput.classList.add('is-invalid');
    }

    return;
  }
  
  if (playerInput.classList.contains('is-invalid')) {
    playerInput.classList.remove('is-invalid');
  }

  $('#initModal').modal('hide');

  // Show wait modal
  $('#waitModal').modal({ backdrop: 'static', keyboard: false });
  $('#waitModal').modal('show');
});

socket.on('start', function (data) {
  startGame(data.players);
});


// Init app
initApp();
