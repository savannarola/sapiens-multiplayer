// interactions.js
import { initialSetup, gameState } from './setup.js';
import { getValidMoves, isInAlliance } from './logic.js';
import { activateMartyrMode } from './martyr.js';
import { createBoard } from './script.js';

// multiplayer
let socket = null;
export function setSocketReference(io) {
  socket = io;
}
export { socket };

function handleSquareClick(row, col) {
  if (gameState.playerColor !== gameState.currentTurn) return;
  const piece = initialSetup[row][col];

  if (!gameState.selectedSquare && piece && piece[0] === gameState.currentTurn) {
    gameState.selectedSquare = { row, col };
    gameState.validMoves = getValidMoves(row, col);
  } else if (
    gameState.selectedSquare &&
    getValidMoves(gameState.selectedSquare.row, gameState.selectedSquare.col).some(
      move => move.row === row && move.col === col
    )
  ) {
    const from = gameState.selectedSquare;
    const to = { row, col };

    movePiece(from, to);

    // multiplayer: envia o movimento para o servidor
    if (socket) {
      socket.emit('move', {
        room: 'room1',
        from,
        to
      });
    }

    gameState.currentTurn = gameState.currentTurn === "w" ? "b" : "w";
    gameState.selectedSquare = null;
    gameState.validMoves = [];
  } else {
    gameState.selectedSquare = null;
    gameState.validMoves = [];
  }

  createBoard();
}

function handleDoubleClick(row, col) {   
  if (gameState.playerColor !== gameState.currentTurn) return;
  const piece = initialSetup[row][col];
  if (!piece || piece[0] !== gameState.currentTurn) return;

  const key = `${row},${col}`;
  if (gameState.rotatedPieces.has(key)) {
    gameState.rotatedPieces.delete(key);
  } else {
    gameState.rotatedPieces.add(key);
  }

  // Envia rotação para o servidor
  if (socket) {
    socket.emit('rotate', {
      room: 'room1',
      row,
      col
    });
  }

  gameState.currentTurn = gameState.currentTurn === "w" ? "b" : "w";
  gameState.selectedSquare = null;
  gameState.validMoves = [];
  createBoard();
}

function movePiece(from, to) {
  const movingPiece = initialSetup[from.row][from.col];
  const targetPiece = initialSetup[to.row][to.col];
  const fromKey = `${from.row},${from.col}`;
  const toKey = `${to.row},${to.col}`;
  const isAlly = targetPiece && targetPiece[0] === movingPiece[0];

  if (targetPiece && targetPiece[0] !== movingPiece[0]) {
    gameState.capturedPieces[targetPiece[0]].push(targetPiece);
    const level = Math.min(6, parseInt(movingPiece[1]) + 1);
    initialSetup[to.row][to.col] = movingPiece[0] + level;
  } else if (isAlly && isInAlliance(from, to)) {
    const sum = parseInt(movingPiece[1]) + parseInt(targetPiece[1]);
    const final = Math.min(6, sum);
    initialSetup[to.row][to.col] = movingPiece[0] + final;
  } else if (!targetPiece) {
    initialSetup[to.row][to.col] = movingPiece;
  } else {
    return;
  }

  initialSetup[from.row][from.col] = "";
  gameState.rotatedPieces.delete(toKey);
  if (gameState.rotatedPieces.has(fromKey)) gameState.rotatedPieces.add(toKey);
  gameState.rotatedPieces.delete(fromKey);

  const resultPiece = initialSetup[to.row][to.col];
  const wasPromotedTo6 = movingPiece[1] !== "6" && resultPiece[1] === "6";
  if (wasPromotedTo6) activateMartyrMode(to, resultPiece[0]);
  if (wasPromotedTo6 && socket) {
  socket.emit('martyr', {
    room: 'room1',
    position: to,
    color: resultPiece[0]
  });
}
}

export { handleSquareClick, handleDoubleClick, movePiece };
