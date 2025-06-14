// setup.js

// Configuração inicial das peças no tabuleiro
const initialSetup = [
  ["b2", "b3", "b4", "b5", "b5", "b4", "b3", "b2"],
  ["b2", "b2", "b2", "b2", "b2", "b2", "b2", "b2"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["w2", "w2", "w2", "w2", "w2", "w2", "w2", "w2"],
  ["w2", "w3", "w4", "w5", "w5", "w4", "w3", "w2"]
];

// Estado global do jogo
const gameState = {
  rotatedPieces: new Set(),
  capturedPieces: { w: [], b: [] },
  currentTurn: "w",
  selectedSquare: null,
  clickTimer: null,
  validMoves: [],
  allianceMarkers: [],
  martyrActive: false,
  martyrTimer: null,
  martyrBlinkInterval: null,
  martyrTargetSquares: [],
  martyrPiecePosition: null,
  playerSwapped: false

};

export { initialSetup, gameState };
