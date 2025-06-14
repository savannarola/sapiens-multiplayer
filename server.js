// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let roomPlayers = {};

io.on('connection', (socket) => {
  console.log('Novo jogador conectado:', socket.id);

  socket.on('joinGame', (room) => {
    socket.join(room);

    if (!roomPlayers[room]) roomPlayers[room] = [];

    if (roomPlayers[room].length < 2) {
      roomPlayers[room].push(socket.id);
      const playerColor = roomPlayers[room].length === 1 ? 'w' : 'b';
      socket.emit('playerAssigned', playerColor);
      socket.to(room).emit('status', 'Outro jogador entrou.');
    } else {
      socket.emit('full', 'Sala cheia.');
    }
  });

  socket.on('move', ({ room, from, to }) => {
    socket.to(room).emit('move', { from, to });
  });

  socket.on('disconnect', () => {
    console.log('Jogador desconectado:', socket.id);
    for (const room in roomPlayers) {
      roomPlayers[room] = roomPlayers[room].filter(id => id !== socket.id);
    }
  });

  socket.on('rotate', ({ room, row, col }) => {
    socket.to(room).emit('rotate', { row, col });
  });

 socket.on("martyrAttack", ({ room, martyrPos, targetPos, captured }) => {
  console.log("Servidor recebeu martyrAttack:", { martyrPos, targetPos, captured });
  socket.to(room).emit("martyrAttack", { martyrPos, targetPos, captured });
});



});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
