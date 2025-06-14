// script.js
import { createSquare, updateTurnDisplay } from './render.js';
import { detectAlliances } from './logic.js';
import { initialSetup, gameState } from './setup.js';
import { movePiece } from './interactions.js';
import { setSocketReference } from './interactions.js';
import { endMartyrMode } from './martyr.js'; // <-- NOVO

const socket = io();
setSocketReference(socket);

socket.emit('joinGame', 'room1');

socket.on('playerAssigned', (color) => {
  gameState.playerColor = color;
  gameState.currentTurn = 'w';
  console.log(`Você é o jogador: ${color}`);
  createBoard();
});

socket.on('move', ({ from, to }) => {
  movePiece(from, to);
  gameState.currentTurn = gameState.currentTurn === 'w' ? 'b' : 'w';
  createBoard();
});

socket.on('rotate', ({ row, col }) => {
  const key = `${row},${col}`;
  if (gameState.rotatedPieces.has(key)) {
    gameState.rotatedPieces.delete(key);
  } else {
    gameState.rotatedPieces.add(key);
  }

  gameState.currentTurn = gameState.currentTurn === "w" ? "b" : "w";
  createBoard();
});

socket.on('martyrAttack', ({ martyrPos, targetPos, captured }) => {
  if (captured) {
    gameState.capturedPieces[captured[0]].push(captured);
  }

  initialSetup[targetPos.row][targetPos.col] = "";
  initialSetup[martyrPos.row][martyrPos.col] = "";

  endMartyrMode();
  createBoard();
});
socket.on('martyrAttack', ({ martyrPos, targetPos, captured }) => {
  console.log("Outro jogador recebeu martyrAttack:", { martyrPos, targetPos, captured });

  if (captured) {
    gameState.capturedPieces[captured[0]].push(captured);
  }

  initialSetup[targetPos.row][targetPos.col] = "";
  initialSetup[martyrPos.row][martyrPos.col] = "";

  import('./martyr.js').then(mod => {
    mod.endMartyrMode();
    createBoard();
  });
});



socket.on('status', (msg) => {
  console.log('Status:', msg);
});

socket.on('full', (msg) => {
  alert(msg);
});

function createBoard() {
  const boardElement = document.getElementById("board");
  boardElement.innerHTML = "";

  detectAlliances();
  updateTurnDisplay();

  const isBlackPlayer = gameState.playerColor === "b";
  const rowOrder = isBlackPlayer ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

  for (let row of rowOrder) {
    for (let col = 0; col < 8; col++) {
      const square = createSquare(row, col);
      boardElement.appendChild(square);
    }
  }

  const topPlayer = document.getElementById("player-top");
  const bottomPlayer = document.getElementById("player-bottom");

  if (isBlackPlayer && !gameState.playerSwapped) {
    const tempHTML = topPlayer.innerHTML;
    topPlayer.innerHTML = bottomPlayer.innerHTML;
    bottomPlayer.innerHTML = tempHTML;
    gameState.playerSwapped = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  gameState.currentTurn = "w";
  gameState.selectedSquare = null;
  gameState.validMoves = [];
  gameState.rotatedPieces = new Set();
  gameState.capturedPieces = { w: [], b: [] };
  gameState.allianceMarkers = [];
  gameState.martyrActive = false;
  gameState.martyrPiecePosition = null;
  gameState.martyrTargetSquares = [];
  gameState.clickTimer = null;

  createBoard();
});

export { createBoard };
