const startBtn = document.getElementById('startGameBtn');
const playerNameInput = document.getElementById('playerName');
const gameScreen = document.getElementById('gameScreen');
const setupScreen = document.getElementById('setupScreen');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const cashSpan = document.getElementById('cash');
const energySpan = document.getElementById('energy');
const xpSpan = document.getElementById('xp');
const levelSpan = document.getElementById('level');
const questionBtn = document.getElementById('questionBtn');
const questionPopup = document.getElementById('questionPopup');
const questionText = document.getElementById('questionText');
const answerInput = document.getElementById('answerInput');
const submitAnswerBtn = document.getElementById('submitAnswerBtn');
const skipAnswerBtn = document.getElementById('skipAnswerBtn');
const feedbackDiv = document.getElementById('feedback');

let gameWidth, gameHeight;

let player = {
  name: '',
  cash: 0,
  energy: 100,
  xp: 0,
  level: 1,
  position: { x: 10, y: 7 },
  kit: 'addition',
};

const TILE_SIZE = 40;
const MAP_COLS = 20;
const MAP_ROWS = 15;

let keysPressed = {};

startBtn.addEventListener('click', () => {
  const name = playerNameInput.value.trim();
  if (!name) return alert('Enter your name!');
  player.name = name;

  const kitRadio = document.querySelector('input[name="kit"]:checked');
  player.kit = kitRadio ? kitRadio.value : 'addition';

  setupScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  initCanvas();
  drawGame();
  updateHUD();

  window.addEventListener('keydown', (e) => keysPressed[e.key.toLowerCase()] = true);
  window.addEventListener('keyup', (e) => keysPressed[e.key.toLowerCase()] = false);

  requestAnimationFrame(gameLoop);
});

function initCanvas() {
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight - document.getElementById('hud').offsetHeight - document.getElementById('header').offsetHeight;
  gameWidth = gameCanvas.width;
  gameHeight = gameCanvas.height;
}

window.addEventListener('resize', () => {
  initCanvas();
  drawGame();
});

function drawGame() {
  ctx.clearRect(0, 0, gameWidth, gameHeight);

  // Draw grid background
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  ctx.strokeStyle = '#004f4f';
  ctx.lineWidth = 1;
  for (let x = 0; x <= MAP_COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE_SIZE, 0);
    ctx.lineTo(x * TILE_SIZE, MAP_ROWS * TILE_SIZE);
    ctx.stroke();
  }
  for (let y = 0; y <= MAP_ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE_SIZE);
    ctx.lineTo(MAP_COLS * TILE_SIZE, y * TILE_SIZE);
    ctx.stroke();
  }

  const px = player.position.x * TILE_SIZE + TILE_SIZE / 2;
  const py = player.position.y * TILE_SIZE + TILE_SIZE / 2;

  ctx.fillStyle = '#00ffd5';
  ctx.beginPath();
  ctx.arc(px, py, TILE_SIZE / 2 - 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(px - 10, py - 5, 5, 0, Math.PI * 2);
  ctx.arc(px + 10, py - 5, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#00ffd5';
  ctx.beginPath();
  ctx.arc(px - 10, py - 5, 2, 0, Math.PI * 2);
  ctx.arc(px + 10, py - 5, 2, 0, Math.PI * 2);
  ctx.fill();
}

function updateHUD() {
  cashSpan.textContent = `Cash: $${player.cash}`;
  energySpan.textContent = `Energy: ${Math.floor(player.energy)}`;
  xpSpan.textContent = `XP: ${player.xp}`;
  levelSpan.textContent = `Level: ${player.level}`;
}

function gameLoop() {
  handleMovement();
  drawGame();
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
    if (player.position.y < MAP_ROWS - 1) {
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
    if (player.position.x < MAP_COLS - 1) {
      player.position.x++;
      moved = true;
    }
  }
  if (moved) {
    player.energy = Math.max(0, player.energy - 1);
  }
}


questionBtn.addEventListener('click', () => {
  if (player.energy <= 0) {
    alert("You don't have enough energy! Answer questions to restore it.");
    return;
  }
  generateQuestion();
});

submitAnswerBtn.addEventListener('click', () => {
  checkAnswer();
});

skipAnswerBtn.addEventListener('click', () => {
  hideQuestion();
});

let currentQuestion = null;
let correctAnswer = null;

function generateQuestion() {
  const maxNum = 20;
  let a = Math.floor(Math.random() * maxNum) + 1;
  let b = Math.floor(Math.random() * maxNum) + 1;
  let op = player.kit;

  if (op === 'division') {
    a = a * b; 
  }

  let questionStr;
  switch (op) {
    case 'addition':
      questionStr = `${a} + ${b} = ?`;
      correctAnswer = a + b;
      break;
    case 'subtraction':
      if (b > a) [a, b] = [b, a]; 
      questionStr = `${a} - ${b} = ?`;
      correctAnswer = a - b;
      break;
    case 'multiplication':
      questionStr = `${a} × ${b} = ?`;
      correctAnswer = a * b;
      break;
    case 'division':
      questionStr = `${a} ÷ ${b} = ?`;
      correctAnswer = a / b;
      break;
  }

  currentQuestion = questionStr;
  questionText.textContent = questionStr;
  answerInput.value = '';
  feedbackDiv.textContent = '';
  questionPopup.classList.remove('hidden');
  answerInput.focus();
}

function checkAnswer() {
  const answer = Number(answerInput.value.trim());
  if (answer === correctAnswer) {
    feedbackDiv.textContent = '✅ Correct!';
    player.cash += 10 + player.upgrades?.cashMultiplier * 5 || 10;
    player.energy = Math.min(100, player.energy + 10);
    player.xp += 10 + player.upgrades?.xpBoost * 5 || 10;
    levelUpCheck();
    setTimeout(() => {
      hideQuestion();
    }, 1000);
  } else {
    feedbackDiv.textContent = '❌ Wrong!';
    player.energy = Math.max(0, player.energy - 5);
    setTimeout(() => {
      hideQuestion();
    }, 1000);
  }
  updateHUD();
}

function hideQuestion() {
  questionPopup.classList.add('hidden');
  answerInput.value = '';
  feedbackDiv.textContent = '';
}

function levelUpCheck() {
  const XP_PER_LEVEL = 100;
  if (player.xp >= XP_PER_LEVEL) {
    player.level++;
    player.xp -= XP_PER_LEVEL;
    confetti();
  }
}

function confetti() {
  const count = 100;
  for (let i = 0; i < count; i++) {
    const x = Math.random() * gameCanvas.width;
    const y = Math.random() * gameCanvas.height;
    const size = Math.random() * 7 + 3;
    const color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}


