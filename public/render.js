// render.js
import { initialSetup, gameState } from './setup.js';
import { getValidMoves, isInAlliance } from './logic.js';
import { handleSquareClick, handleDoubleClick } from './interactions.js';
import { socket } from './interactions.js';


function updateTurnDisplay() {
  const imagePlayer1 = document.getElementById("image-player-1");
  const imagePlayer2 = document.getElementById("image-player-2");
  imagePlayer1.style.border = gameState.currentTurn === "w" ? "none" : "4px solid #f3f3dc";
  imagePlayer2.style.border = gameState.currentTurn === "w" ? "4px solid #f3f3dc" : "none";
}

function createPieceImage(piece, isRotated) {
  const img = document.createElement("img");
  img.src = `img/${piece}.png`;
  img.alt = piece;
  if (isRotated) img.classList.add("rotated");
  return img;
}

function createMoveIndicator(isEnemy, isRotatedEnemy) {
  const point = document.createElement("img");
  point.src = isEnemy ? "img/pointfinal.gif" : "img/point.png";
  point.alt = isEnemy ? "target" : "point";
  point.classList.add(isEnemy ? "point-enemy" : "point");
  if (isEnemy && isRotatedEnemy) point.classList.add("enemy-rotated");
  return point;
}

function createAllianceMarker(pieceColor, isDiagonal) {
  const marker = document.createElement("img");
  marker.src = pieceColor === "w" ? "img/aliace_w.png" : "img/aliace_b.png";
  marker.classList.add("alliance-marker");
  if (isDiagonal) marker.style.transform = "rotate(45deg)";
  setInterval(() => {
    marker.style.display = marker.style.display === "none" ? "block" : "none";
  }, 1500);
  return marker;
}

function createSquare(row, col) {
  const square = document.createElement("div");
  square.classList.add("square", (row + col) % 2 === 0 ? "white" : "black");
  square.dataset.row = row;
  square.dataset.col = col;

  if (
    gameState.selectedSquare &&
    gameState.selectedSquare.row === row &&
    gameState.selectedSquare.col === col
  ) {
    square.classList.add("selected");
  }

  const piece = initialSetup[row][col];
  if (piece) {
    const key = `${row},${col}`;
    const img = createPieceImage(piece, gameState.rotatedPieces.has(key));
    square.appendChild(img);
  }

  // Modo mártir
  if (
    gameState.martyrActive &&
    gameState.martyrTargetSquares.some(p => p.row === row && p.col === col)
  ) {
    const martyrMarker = document.createElement("img");
    martyrMarker.src = gameState.currentTurn === "w" ? "img/martir_w.png" : "img/martir_b.png";
    martyrMarker.classList.add("martyr-marker");
    martyrMarker.style.position = "absolute";
    martyrMarker.style.top = "0";
    martyrMarker.style.left = "0";
    martyrMarker.style.width = "100%";
    martyrMarker.style.height = "100%";
    martyrMarker.style.zIndex = "2";
    square.appendChild(martyrMarker);

    square.addEventListener("click", () => {
      const martyrPos = gameState.martyrPiecePosition;
      const martyrPiece = initialSetup[martyrPos.row][martyrPos.col];
      const targetPiece = initialSetup[row][col];

      if (!martyrPiece || !targetPiece) return;

      // Remove localmente
      gameState.capturedPieces[targetPiece[0]].push(targetPiece);
      initialSetup[row][col] = "";
      initialSetup[martyrPos.row][martyrPos.col] = "";

      // Envia para o servidor
      socket.emit("martyrAttack", {
        room: "room1",
        martyrPos,
        targetPos: { row, col },
        captured: targetPiece
      });

      // Finaliza modo mártir localmente
      import("./martyr.js").then(mod => mod.endMartyrMode());
    });

  }

  if (gameState.validMoves.some(move => move.row === row && move.col === col)) {
    const selectedPiece = initialSetup[gameState.selectedSquare.row][gameState.selectedSquare.col];
    const targetPiece = initialSetup[row][col];
    const isEnemy = targetPiece && selectedPiece[0] !== targetPiece[0];
    const isRotatedEnemy = gameState.rotatedPieces.has(`${row},${col}`);
    const isAlliance = targetPiece && selectedPiece[0] === targetPiece[0] && isInAlliance(gameState.selectedSquare, { row, col });

    if (!isAlliance) square.appendChild(createMoveIndicator(isEnemy, isRotatedEnemy));
    if (isAlliance) square.appendChild(createAllianceMarker(targetPiece[0], isDiagonal(gameState.selectedSquare, { row, col })));
  }

  square.addEventListener("click", () => {
    if (gameState.clickTimer === null) {
      gameState.clickTimer = setTimeout(() => {
        handleSquareClick(row, col);
        gameState.clickTimer = null;
      }, 300);
    }
  });

  square.addEventListener("dblclick", () => {
    clearTimeout(gameState.clickTimer);
    gameState.clickTimer = null;
    handleDoubleClick(row, col);
  });

  return square;
}

function isDiagonal(a, b) {
  return Math.abs(a.row - b.row) === Math.abs(a.col - b.col);
}

export { createSquare, updateTurnDisplay };
