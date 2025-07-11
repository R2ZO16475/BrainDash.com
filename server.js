const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 4000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

let players = [];
let gameStarted = false;

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('join-game', (playerName) => {
    const player = {
      id: socket.id,
      name: playerName || 'Player',
      color: getRandomColor(),
      x: 0,
      y: 0,
      cash: 0,
      energy: 100,
      xp: 0,
      level: 1
    };
    players.push(player);
    io.emit('players-update', players);
  });

  socket.on('start-game', () => {
    gameStarted = true;
    io.emit('game-started');
  });

  socket.on('player-move', ({ id, direction }) => {
    const player = players.find(p => p.id === id);
    if (player && player.energy > 0) {
      if (direction === 'left') player.x -= 1;
      if (direction === 'right') player.x += 1;
      if (direction === 'up') player.y -= 1;
      if (direction === 'down') player.y += 1;
      player.energy = Math.max(0, player.energy - 1);
      io.emit('players-update', players);
    }
  });

  socket.on('disconnect', () => {
    players = players.filter(p => p.id !== socket.id);
    io.emit('players-update', players);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

function getRandomColor() {
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#F67280', '#6A0572'];
  return colors[Math.floor(Math.random() * colors.length)];
}

