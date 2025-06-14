// martyr.js
import { initialSetup, gameState } from './setup.js';
import { createBoard } from './script.js';

function activateMartyrMode(promotedPosition, color) {
  gameState.martyrActive = true;
  gameState.martyrPiecePosition = promotedPosition;

  const enemyColor = color === "w" ? "b" : "w";
  gameState.martyrTargetSquares = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = initialSetup[r][c];
      if (piece && piece[0] === enemyColor) {
        gameState.martyrTargetSquares.push({ row: r, col: c });
      }
    }
  }

  updateMartyrMarkers();

  gameState.martyrBlinkInterval = setInterval(() => {
    const elements = document.querySelectorAll(".martyr-marker");
    elements.forEach(el => {
      el.style.display = el.style.display === "none" ? "block" : "none";
    });
  }, 500);

  gameState.martyrTimer = setTimeout(() => {
    endMartyrMode();
  }, 5000);
}

function endMartyrMode() {
  gameState.martyrActive = false;
  gameState.martyrPiecePosition = null;
  gameState.martyrTargetSquares = [];
  clearInterval(gameState.martyrBlinkInterval);
  clearTimeout(gameState.martyrTimer);
  createBoard();
}

function updateMartyrMarkers() {
  createBoard();
}

export { activateMartyrMode, endMartyrMode, updateMartyrMarkers };
