// logic.js
import { initialSetup, gameState } from './setup.js';

// Verifica se duas posições estão na mesma diagonal
function isDiagonal(a, b) {
  return Math.abs(a.row - b.row) === Math.abs(a.col - b.col);
}

// Verifica se o caminho entre dois pontos está livre
function isPathClear(r1, c1, r2, c2) {
  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);
  let r = r1 + dr;
  let c = c1 + dc;
  while (r !== r2 || c !== c2) {
    if (initialSetup[r][c]) return false;
    r += dr;
    c += dc;
  }
  return true;
}

// Detecta alianças no tabuleiro
function detectAlliances() {
  gameState.allianceMarkers = [];
  const inRange = (row, player) => (player === "w" ? row <= 3 : row >= 4);

  const isEmptyBetween = (r1, c1, r2, c2) => {
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    let r = r1 + dr, c = c1 + dc;
    while (r !== r2 || c !== c2) {
      if (initialSetup[r][c]) return false;
      r += dr; c += dc;
    }
    return true;
  };

  for (let r1 = 0; r1 < 8; r1++) {
    for (let c1 = 0; c1 < 8; c1++) {
      const piece1 = initialSetup[r1][c1];
      if (!piece1) continue;
      const color = piece1[0];
      const value = piece1[1];
      const rot1 = gameState.rotatedPieces.has(`${r1},${c1}`);
      if (!inRange(r1, color)) continue;

      for (let r2 = 0; r2 < 8; r2++) {
        for (let c2 = 0; c2 < 8; c2++) {
          if (r1 === r2 && c1 === c2) continue;
          const piece2 = initialSetup[r2][c2];
          if (!piece2 || piece2[0] !== color || piece2[1] !== value) continue;
          const rot2 = gameState.rotatedPieces.has(`${r2},${c2}`);
          if (!inRange(r2, color)) continue;

          const sameLine = r1 === r2 || c1 === c2;
          const sameDiag = isDiagonal({ row: r1, col: c1 }, { row: r2, col: c2 });

          if (!rot1 && !rot2 && sameLine && isEmptyBetween(r1, c1, r2, c2)) {
            gameState.allianceMarkers.push({ row: r1, col: c1, diagonal: false });
            gameState.allianceMarkers.push({ row: r2, col: c2, diagonal: false });
          } else if (rot1 && rot2 && sameDiag && isEmptyBetween(r1, c1, r2, c2)) {
            gameState.allianceMarkers.push({ row: r1, col: c1, diagonal: true });
            gameState.allianceMarkers.push({ row: r2, col: c2, diagonal: true });
          }
        }
      }
    }
  }
}

// Verifica se duas peças estão em aliança válida
function isInAlliance(from, to) {
  return gameState.allianceMarkers.some(marker =>
    marker.row === from.row && marker.col === from.col &&
    gameState.allianceMarkers.some(other =>
      other.row === to.row && other.col === to.col &&
      other.diagonal === marker.diagonal
    )
  );
}

// Verifica se um movimento é válido
function isValidMove(fromRow, fromCol, toRow, toCol) {
  return getValidMoves(fromRow, fromCol).some(move => move.row === toRow && move.col === toCol);
}

// Calcula os movimentos válidos de uma peça
function getValidMoves(row, col) {
  const piece = initialSetup[row][col];
  if (!piece) return [];
  const steps = parseInt(piece[1]);
  const isRotated = gameState.rotatedPieces.has(`${row},${col}`);

  const directions = isRotated
    ? [ { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 } ]
    : [ { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 } ];

  const moves = [];

  for (const { dr, dc } of directions) {
    for (let step = 1; step <= steps; step++) {
      const r = row + dr * step;
      const c = col + dc * step;
      if (r < 0 || r >= 8 || c < 0 || c >= 8) break;

      const target = initialSetup[r][c];
      if (target === "") {
        moves.push({ row: r, col: c });
      } else {
        const isEnemy = target[0] !== piece[0];
        const isAlliance = !isEnemy && isInAlliance({ row, col }, { row: r, col: c });
        if (isEnemy || isAlliance) moves.push({ row: r, col: c });
        break;
      }
    }
  }

  for (const { dr, dc } of directions) {
    let step = steps + 1;
    while (true) {
      const r = row + dr * step;
      const c = col + dc * step;
      if (r < 0 || r >= 8 || c < 0 || c >= 8) break;

      const target = initialSetup[r][c];
      if (!target) {
        step++;
        continue;
      }

      if (target[0] === piece[0] && target[1] === piece[1] && isInAlliance({ row, col }, { row: r, col: c }) && isPathClear(row, col, r, c)) {
        const drUnit = Math.sign(r - row);
        const dcUnit = Math.sign(c - col);
        let rMid = row + drUnit;
        let cMid = col + dcUnit;

        while (rMid !== r || cMid !== c) {
          moves.push({ row: rMid, col: cMid });
          rMid += drUnit;
          cMid += dcUnit;
        }

        moves.push({ row: r, col: c });
      }
      break;
    }
  }

  return moves;
}

export { isDiagonal, isPathClear, detectAlliances, isInAlliance, isValidMove, getValidMoves };
