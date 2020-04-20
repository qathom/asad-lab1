const socket = io('http://localhost:3000');

let PLAYER_ID = null;
let gameState = 1; // Init with No more bets
let playerBank = 10;

function closest(element, selector) {
  let el = element;

  do {
    if (el.matches(selector)) {
      return el;
    }
    el = (el.parentElement || el.parentNode);
  } while (el !== null && el.nodeType === 1);

  return null;
}

function setPlayers(players) {
  // Display the list of players
  const playerContainer = document.querySelector('#players');
  const ul = document.createElement('ul');

  players.forEach(function (player) {
    const item = document.createElement('li');
    item.setAttribute('data-id', player.id);
    item.innerHTML = player.id + ' ' + player.bank;

    ul.appendChild(item);
  });

  playerContainer.innerHTML = '';
  playerContainer.appendChild(ul);
}

function setPlayerBank(playerId, bank) {
  console.log('PLAYER ID', playerId);
  const playerEl = document.querySelector(`#players [data-id="${playerId}"]`);
  playerEl.innerHTML = playerId + ' ' + bank;
}

function enableRoulette() {
  const rouletteEl = document.querySelector('.roulette');

  if (rouletteEl.classList.contains('disabled')) {
    rouletteEl.classList.remove('disabled');
  }
}

function disableRoulette() {
  const rouletteEl = document.querySelector('.roulette');

  if (!rouletteEl.classList.contains('disabled')) {
    rouletteEl.classList.add('disabled');
  }
}

function resetRoulette() {
  document.querySelectorAll('.roulette td.selected').forEach(function (element) {
    element.classList.remove('selected');
  });
}

function playerJoin(players) {
  // Remove the init modal
  if (document.querySelector('#initModal').classList.contains('show')) {
    $('#initModal').modal('hide');
  }

  setPlayers(players);
}

function initApp() {
  // Show the modal
  $('#initModal').modal({ backdrop: 'static', keyboard: false });
  $('#initModal').modal('show');

  document.querySelector('#playButton').addEventListener('click', function () {
    const playerId = document.querySelector('#inputPlayerName').value;

    PLAYER_ID = playerId;

    socket.emit('init', { playerId: PLAYER_ID });
  });

  // Board
  document.querySelector('#tableRoulette').addEventListener('click', function (event) {
    const element = closest(event.target, 'td');
    const caseValueElement = event.target.innerHTML;

    if (gameState === 1) {
      // No more bets
      return;
    }

    // Toggle selection
    element.classList.toggle('selected');

    const cell = parseInt(caseValueElement, 10);

    let betType = 0;

    if (isNaN(cell)) {
      switch(caseValueElement) {
        case 'ODD':{//1
          betType = 1;
          break
        }
        case 'EVEN':{//2
          betType = 2;
          break
        }
        case 'RED': {//3
          betType = 3;
          break
        }
        case 'BLACK':{//4
          betType = 4;
          break
        }
      }
    }

    let amount = 1;

    console.log('CELL', cell, 'BetType', betType);

    socket.emit('bet', { betType: betType, cell: cell, amount: amount, playerId: PLAYER_ID })
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
});

socket.on('playerJoin', function (data) {
  playerJoin(data.players);
});

socket.on('bet', function (data) {
  console.log('BET', data);
  setPlayerBank(data.bet.player.playerId, data.bet.player.bank);
});

socket.on('state', function (state) {
  console.log('STATE', state);

  // Update state
  gameState = state;

  switch (true) {
    case (gameState === 0):
      // Open
      enableRoulette();
      break;
    case (gameState === 1):
      // No more bets
      disableRoulette();
      break;
    case (gameState === 2):
      // Result
      resetRoulette();
      break;
    default:
      break;
  }
});


// Init app
initApp();
