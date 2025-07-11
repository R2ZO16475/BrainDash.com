const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
  name: '',
  x: 200,
  y: 200,
  size: 30,
  color: getRandomColor(),
  energy: 100,
  cash: 0,
  xp: 0
};

let keys = {};
let currentQuestion = null;
let questionCooldown = 0;

function startGame() {
  player.name = document.getElementById('nameInput').value || "Player";
  document.getElementById('playerName').textContent = `👤 ${player.name}`;
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  gameLoop();
}

window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayer();
  drawPlayer();
  updateHUD();

  if (Math.random() < 0.005 && !currentQuestion && questionCooldown <= 0) {
    askQuestion();
  }

  if (questionCooldown > 0) questionCooldown--;

  requestAnimationFrame(gameLoop);
}

function movePlayer() {
  if (player.energy <= 0) return;
  if (keys['w'] || keys['arrowup']) player.y -= 5;
  if (keys['s'] || keys['arrowdown']) player.y += 5;
  if (keys['a'] || keys['arrowleft']) player.x -= 5;
  if (keys['d'] || keys['arrowright']) player.x += 5;
  player.energy -= 0.1;
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
}

function updateHUD() {
  document.getElementById('energy').textContent = Math.floor(player.energy);
  document.getElementById('cash').textContent = player.cash;
  document.getElementById('xp').textContent = player.xp;
}

function askQuestion() {
  const num1 = Math.floor(Math.random() * 10 + 1);
  const num2 = Math.floor(Math.random() * 10 + 1);
  const answer = num1 * num2;
  currentQuestion = { q: `What is ${num1} × ${num2}?`, a: answer };
  document.getElementById('questionText').textContent = currentQuestion.q;
  document.getElementById('questionBox').classList.remove('hidden');
}

function submitAnswer() {
  const input = parseInt(document.getElementById('answerInput').value);
  if (input === currentQuestion.a) {
    player.cash += 10;
    player.xp += 5;
    player.energy = Math.min(100, player.energy + 20);
    alert("✅ Correct!");
  } else {
    player.energy = Math.max(0, player.energy - 10);
    alert("❌ Wrong!");
  }
  currentQuestion = null;
  document.getElementById('questionBox').classList.add('hidden');
  questionCooldown = 300;
}

function getRandomColor() {
  const colors = ['#00f2ff', '#ff0077', '#00ff88', '#ffaa00'];
  return colors[Math.floor(Math.random() * colors.length)];
}
