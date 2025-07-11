const startBtn = document.getElementById('startBtn');
const playerNameInput = document.getElementById('playerName');
const lobby = document.getElementById('lobby');
const gameSection = document.getElementById('game');
const cashSpan = document.getElementById('cash');
const energySpan = document.getElementById('energy');
const xpSpan = document.getElementById('xp');
const levelSpan = document.getElementById('level');
const shopBtn = document.getElementById('shopBtn');
const questionBtn = document.getElementById('questionBtn');
const questionPopup = document.getElementById('questionPopup');
const questionText = document.getElementById('questionText');
const answerInput = document.getElementById('answerInput');
const feedback = document.getElementById('feedback');
const submitAnswerBtn = document.getElementById('submitAnswerBtn');
const skipAnswerBtn = document.getElementById('skipAnswerBtn');
const shopPopup = document.getElementById('shopPopup');
const shopItemsDiv = document.getElementById('shopItems');
const closeShopBtn = document.getElementById('closeShopBtn');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');

let player = {
  name: '',
  cash: 0,
  energy: 100,
  xp: 0,
  level: 1,
  position: { x: 5, y: 5 },
  cashPerCorrect: 10,
  energyDrainRate: 1,
  xpPerCorrect: 10,
  upgrades: {
    cashMultiplier: 0,
    energyDrainResistance: 0,
    xpBoost: 0,
  }
};

const TILE_SIZE = 50;
const MAP_WIDTH = 15;
const MAP_HEIGHT = 9;
gameCanvas.width = TILE_SIZE * MAP_WIDTH;
gameCanvas.height = TILE_SIZE * MAP_HEIGHT;

let keysPressed = {};
let questionActive = false;
let currentQuestion = null;
let correctAnswer = null;

startBtn.addEventListener('click', () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert('Please enter your name.');
    return;
  }
  player.name = name;
  lobby.classList.add('hidden');
  gameSection.classList.remove('hidden');
  drawGame();
  window.requestAnimationFrame(gameLoop);
});

function drawGame() {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  ctx.strokeStyle = '#ec2f4b';
  ctx.lineWidth = 2;
  for (let x = 0; x <= MAP_WIDTH; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE, 0);
    ctx.lineTo(x * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    ctx.stroke();
  }
  for (let y = 0; y <= MAP_HEIGHT; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE_SIZE);
    ctx.lineTo(MAP_WIDTH * TILE_SIZE, y * TILE_SIZE);
    ctx.stroke();
  }

  const px = player.position.x * TILE_SIZE + TILE_SIZE/2;
  const py = player.position.y * TILE_SIZE + TILE_SIZE/2;
  const radius = 12;

  const grad = ctx.createRadialGradient(px, py, 10, px, py, radius);
  grad.addColorStop(0, '#fff');
  grad.addColorStop(1, '#ec2f4b');

  ctx.fillStyle = grad;
  roundRect(ctx, player.position.x * TILE_SIZE + 6, player.position.y * TILE_SIZE + 6, TILE_SIZE - 12, TILE_SIZE - 12, radius);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(px - 10, py - 5, 5, 0, Math.PI * 2);
  ctx.arc(px + 10, py - 5, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ec2f4b';
  ctx.beginPath();
  ctx.arc(px - 10, py - 5, 2, 0, Math.PI * 2);
  ctx.arc(px + 10, py - 5, 2, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function gameLoop() {
  handleMovement();
  drawGame();
  updateHUD();
  requestAnimationFrame(gameLoop);
}

function handleMovement() {
  if (questionActive) return;
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
    player.energy = Math.max(0, player.energy - player.energyDrainRate);
  }
}

window.addEventListener('keydown', e => {
  keysPressed[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', e => {
  keysPressed[e.key.toLowerCase()] = false;
});

function updateHUD() {
  cashSpan.textContent = `Cash: $${player.cash}`;
  energySpan.textContent = `Energy: ${Math.floor(player.energy)}`;
  xpSpan.textContent = `XP: ${player.xp}`;
  levelSpan.textContent = `Level: ${player.level}`;
}

questionBtn.addEventListener('click', () => {
  if (questionActive) return;
  if (player.energy <= 0) {
    alert("You don't have energy! Answer questions to restore it.");
    return;
  }
  generateQuestion();
});

submitAnswerBtn.addEventListener('click', checkAnswer);
skipAnswerBtn.addEventListener('click', () => {
  questionPopup.classList.add('hidden');
  questionActive = false;
  feedback.textContent = '';
  answerInput.value = '';
});

function generateQuestion() {
  questionActive = true;
  const max = 20;
  const a = Math.floor(Math.random() * max) + 1;
  const b = Math.floor(Math.random() * max) + 1;

  const ops = ['+', '-', '×', '÷'];
  const op = ops[Math.floor(Math.random() * ops.length)];

  let questionStr, answer;

  switch(op) {
    case '+':
      questionStr = `${a} + ${b} = ?`;
      answer = a + b;
      break;
    case '-':
      if (b > a) [a, b] = [b, a];
      questionStr = `${a} - ${b} = ?`;
      answer = a - b;
      break;
    case '×':
      questionStr = `${a} × ${b} = ?`;
      answer = a * b;
      break;
    case '÷':
      const dividend = a * b;
      questionStr = `${dividend} ÷ ${b} = ?`;
      answer = dividend / b;
      break;
  }
  currentQuestion = questionStr;
  correctAnswer = answer;
  questionText.textContent = questionStr;
  questionPopup.classList.remove('hidden');
  answerInput.value = '';
  feedback.textContent = '';
  answerInput.focus();
}

function checkAnswer() {
  const val = Number(answerInput.value);
  if (isNaN(val)) {
    feedback.textContent = 'Please enter a number';
    return;
  }
  if (val === correctAnswer) {
    feedback.textContent = '✅ Correct!';
    player.cash += player.cashPerCorrect + player.upgrades.cashMultiplier * 5;
    player.energy = Math.min(100, player.energy + 10 + player.upgrades.energyDrainResistance * 2);
    player.xp += player.xpPerCorrect + player.upgrades.xpBoost * 5;
    checkLevelUp();
  } else {
    feedback.textContent = '❌ Wrong!';
    player.energy = Math.max(0, player.energy - 5);
  }
  answerInput.value = '';
  setTimeout(() => {
    questionPopup.classList.add('hidden');
    questionActive = false;
    feedback.textContent = '';
  }, 1200);
}

function checkLevelUp() {
  if (player.xp >= 100) {
    player.level++;
    player.xp = 0;
    confetti();
  }
}

function confetti() {
  alert('🎉 Level Up! 🎉');
}

shopBtn.addEventListener('click', () => {
  buildShop();
  shopPopup.classList.remove('hidden');
});

closeShopBtn.addEventListener('click', () => {
  shopPopup.classList.add('hidden');
});

function buildShop() {
  shopItemsDiv.innerHTML = '';
  const upgrades = [
    {
      id: 'cashMultiplier',
      name: 'Cash Per Answer +5',
      cost: 50 + player.upgrades.cashMultiplier * 25,
      description: 'Earn more cash per correct answer'
    },
    {
      id: 'energyDrainResistance',
      name: 'Energy Drain Slower',
      cost: 60 + player.upgrades.energyDrainResistance * 30,
      description: 'Energy drains more slowly'
    },
    {
      id: 'xpBoost',
      name: 'XP Boost +5',
      cost: 70 + player.upgrades.xpBoost * 35,
      description: 'Gain more XP per correct answer'
    },
  ];

  upgrades.forEach(upg => {
    const div = document.createElement('div');
    div.className = 'shopItem';
    div.innerHTML = `<div>
      <div>${upg.name}</div>
      <small>${upg.description}</small>
      <div>Cost: $${upg.cost}</div>
    </div>
    <button data-id="${upg.id}">Buy</button>`;
    shopItemsDiv.appendChild(div);
  });

  shopItemsDiv.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.id;
      buyUpgrade(id);
    });
  });
}

function buyUpgrade(id) {
  let cost, level;
  switch(id) {
    case 'cashMultiplier':
      cost = 50 + player.upgrades.cashMultiplier * 25;
      if (player.cash >= cost) {
        player.cash -= cost;
        player.upgrades.cashMultiplier++;
      }
      break;
    case 'energyDrainResistance':
      cost = 60 + player.upgrades.energyDrainResistance * 30;
      if (player.cash >= cost) {
        player.cash -= cost;
        player.upgrades.energyDrainResistance++;
        player.energyDrainRate = Math.max(0.1, player.energyDrainRate - 0.1);
      }
      break;
    case 'xpBoost':
      cost = 70 + player.upgrades.xpBoost * 35;
      if (player.cash >= cost) {
        player.cash -= cost;
        player.upgrades.xpBoost++;
      }
      break;
  }
  buildShop();
  updateHUD();
}



