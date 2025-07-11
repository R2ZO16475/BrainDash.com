const playerNameInput = document.getElementById('playerName');
const gameCodeInput = document.getElementById('gameCode');
const joinCreateBtn = document.getElementById('joinCreateBtn');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const gameUI = document.getElementById('gameUI');
const playerStats = document.getElementById('playerStats');
const shopBtn = document.getElementById('shopBtn');
const shopModal = document.getElementById('shopModal');
const closeShopBtn = document.getElementById('closeShopBtn');
const shopItems = document.getElementById('shopItems');

let gameStarted = false;
let player = {
  name: '',
  cash: 0,
  energy: 100,
  xp: 0,
  level: 1,
  position: { x: 5, y: 5 },
  upgrades: {
    cashMultiplier: 0,
    energyEfficiency: 0,
    xpBoost: 0
  }
};

const TILE_SIZE = 30;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;

const keysPressed = {};
let energyDrainInterval;

joinCreateBtn.addEventListener('click', () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert('Please enter your name');
    return;
  }
  player.name = name;
  startGame();
});

function startGame() {
  gameStarted = true;
  document.querySelector('.auth').classList.add('hidden');
  gameUI.classList.remove('hidden');
  drawMap();
  updateHUD();
  energyDrainInterval = setInterval(drainEnergy, 300);
  window.addEventListener('keydown', e => {
    keysPressed[e.key.toLowerCase()] = true;
  });
  window.addEventListener('keyup', e => {
    keysPressed[e.key.toLowerCase()] = false;
  });
  requestAnimationFrame(gameLoop);
}

function drawMap() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      ctx.fillStyle = '#222';
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1);
    }
  }

  ctx.fillStyle = '#00ffd5';
  ctx.fillRect(player.position.x * TILE_SIZE, player.position.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function updateHUD() {
  playerStats.textContent = `Cash: $${player.cash} | Energy: ${player.energy} | XP: ${player.xp} | Level: ${player.level}`;
}

function drainEnergy() {
  if (player.energy > 0) {
    let drain = 1 - player.upgrades.energyEfficiency * 0.1;
    player.energy = Math.max(0, player.energy - drain);
    updateHUD();
  }
}

function gameLoop() {
  if (!gameStarted) return;
  handleMovement();
  drawMap();
  updateHUD();
  requestAnimationFrame(gameLoop);
}

function handleMovement() {
  if (player.energy <= 0) return;

  let moved = false;
  if (keysPressed['w'] || keysPressed['arrowup']) {
    if (player.position.y > 0) {
      player.position.y--;
      moved = true;
    }
  }
  if (keysPressed['s'] || keysPressed['arrowdown']) {
    if (player.position.y < MAP_HEIGHT - 1) {
      player.position.y++;
      moved = true;
    }
  }
  if (keysPressed['a'] || keysPressed['arrowleft']) {
    if (player.position.x > 0) {
      player.position.x--;
      moved = true;
    }
  }
  if (keysPressed['d'] || keysPressed['arrowright']) {
    if (player.position.x < MAP_WIDTH - 1) {
      player.position.x++;
      moved = true;
    }
  }
  if (moved) {
    player.energy = Math.max(0, player.energy - 1);
  }
}

shopBtn.addEventListener('click', () => {
  shopModal.classList.remove('hidden');
});

closeShopBtn.addEventListener('click', () => {
  shopModal.classList.add('hidden');
});

shopItems.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    const upgrade = e.target.dataset.upgrade;
    buyUpgrade(upgrade);
  }
});

function buyUpgrade(upgrade) {
  const upgradeCosts = {
    cashMultiplier: 50,
    energyEfficiency: 50,
    xpBoost: 50
  };
  const cost = upgradeCosts[upgrade] * (player.upgrades[upgrade] + 1);

  if (player.cash < cost) {
    alert('Not enough cash!');
    return;
  }
  player.cash -= cost;
  player.upgrades[upgrade]++;
  alert(`Purchased upgrade: ${upgrade} Level ${player.upgrades[upgrade]}`);
  updateHUD();
}

