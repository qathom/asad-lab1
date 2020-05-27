
const STORAGE_TOKEN = 'asad_prdq';

function getToken() {
  return localStorage.getItem(STORAGE_TOKEN) || null;
}

function setToken(token) {
  localStorage.setItem(STORAGE_TOKEN, token);
}

function setSocketPayload(payload) {
  return Object.assign(payload || {}, { token: getToken() });
}

const socket = io('http://localhost:3000');

let PLAYER_ID = null;
let gameState = 1; // Init with No more bets

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

    // Player info
    const playerInfo = document.createElement('span');
    playerInfo.classList.add('player-info');

    playerInfo.innerHTML = player.id + ' ' + player.bank;

    item.appendChild(playerInfo);

    // Player winner state
    const playerWinner = document.createElement('span');
    playerWinner.classList.add('player-winner-state');
    playerWinner.classList.add('d-none');

    playerWinner.innerHTML = '[winner]';

    item.appendChild(playerWinner);

    ul.appendChild(item);
  });

  playerContainer.innerHTML = '';
  playerContainer.appendChild(ul);
}

function setPlayerBank(playerId, bank, betsAmount, winner) {
  console.log('PLAYER ID', playerId);
  const playerEl = document.querySelector(`#players [data-id="${playerId}"]`);
  playerEl.querySelector('.player-info').innerHTML = playerId + ' ' + (bank-betsAmount);

  const playerWinnerEl = playerEl.querySelector('.player-winner-state');

  if (winner) {
    if (playerWinnerEl.classList.contains('d-none')) {
      playerWinnerEl.classList.remove('d-none');
    }
  } else {
    if (!playerWinnerEl.classList.contains('d-none')) {
      playerWinnerEl.classList.add('d-none');
    }
  }
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
  // Set modal settings
  document.querySelector('#playButton').addEventListener('click', function () {
    if(document.querySelector('#inputLoginPlayerName').value === "") {
       console.log("invalid player name");
       alert("invalid player name");
    } else if(document.querySelector('#inputLoginPassword').value == "") {
       console.log("provide password");
       alert("provide password");
    } else {
       const playerId = document.querySelector('#inputLoginPlayerName').value;
       const pwd = document.querySelector('#inputLoginPassword').value;
       PLAYER_ID = playerId;
       PLAYER_PWD = pwd;
       socket.emit('init', setSocketPayload({ playerId: PLAYER_ID, playerPassword: PLAYER_PWD }));  
    }
  });
  
  document.querySelector('#playFromCreateAccountButton').addEventListener('click', function () {
    if(document.querySelector('#inputBalance').value <= 0 || document.querySelector('#inputBalance').value > 1000) {
       console.log("invalid balance");
       alert("invalid balance");
    } else if(document.querySelector('#inputPassword').value !== document.querySelector('#inputPasswordConfirm').value) {
       console.log(document.querySelector('#inputPassword').value);
       console.log(document.querySelector('#inputPasswordConfirm').value);
       console.log("password don't match");
       alert("password don't match");
    } else if(document.querySelector('#inputPlayerName').value === "") {
       console.log("invalid player name");
       alert("invalid player name");
    } else {
       const playerId = document.querySelector('#inputPlayerName').value;
       const pwd = document.querySelector('#inputPassword').value;
       const balance = document.querySelector('#inputBalance').value;
       PLAYER_ID = playerId;
       PLAYER_PWD = pwd;
       BALANCE = parseInt(balance, 10);
       socket.emit('createAccount', setSocketPayload({ playerId: PLAYER_ID, playerPassword: PLAYER_PWD, playerBalance: BALANCE }));
    }
  });
  
  document.querySelector('#createAccountButton').addEventListener('click', function () {
    $('#initModal').modal('hide');
    $('#initCreateAccountModal').modal({ backdrop: 'static', keyboard: false });
    $('#initCreateAccountModal').modal('show');
  });

  // Board
  document.querySelector('#tableRoulette').addEventListener('click', function (event) {
    const element = closest(event.target, 'td');
    const caseValueElement = event.target.innerHTML;

    if (!element || gameState !== 0 || element.classList.contains('empty')) {
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

    socket.emit('bet', setSocketPayload({ betType: betType, cell: cell, amount: amount, playerId: PLAYER_ID }));
  });
}

socket.on('unauthorized', (msg) => {
  $('#initModal').modal({ backdrop: 'static', keyboard: false });
  $('#initModal').modal('show');
});

console.log('AUTHENTICATing');
socket.emit('authenticate', setSocketPayload());

socket.on('authenticated', (data) => {
  console.log('AUTHENTICATED', data.id);
  PLAYER_ID = data.id;

  $('#initModal').modal('hide');
});

socket.on('init', function (data) {
  const playerInput = document.querySelector('#inputLoginPlayerName');
 
  if (!data.canLogin) {
    if (!playerInput.classList.contains('is-invalid')) {
      playerInput.classList.add('is-invalid');
    }

    return;
  }
  
  if (playerInput.classList.contains('is-invalid')) {
    playerInput.classList.remove('is-invalid');
  }

  // Save content
  setToken(data.token);

  $('#initModal').modal('hide');
});

socket.on('createAccount', function (data) {
  // Dismiss the registration modal
  $('#initCreateAccountModal').modal('hide');
  // Show the login modal
  $('#initModal').modal('show');
  console.log('DATA', data);
});

socket.on('playerJoin', function (data) {
  playerJoin(data.players);
});

socket.on('number', function (randomNumber) {
  console.log('RANDOM NUMBER', randomNumber);
});

socket.on('bet', function (data) {
  console.log('BET', data);
  setPlayerBank(data.bet.player.playerId, data.bet.player.bank, data.bet.player.currentAmountBetted, false);
});

socket.on('results', function (data) {
  console.log('RESULTS', data);

  data.winners.forEach(function (winner) {
    console.log('WINNER', winner);
    setPlayerBank(winner.id, winner.bank,  winner.currentAmountBetted, true);
  });
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
