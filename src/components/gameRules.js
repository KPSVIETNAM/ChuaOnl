const CHESS_FILES = 8;
const XIANGQI_ROWS = 10;
const XIANGQI_COLS = 9;
const GO_SIZE = 9;

const makeBoard = (rows, cols) => Array(rows * cols).fill('');
const position = (row, col, cols) => row * cols + col;
const inside = (row, col, rows, cols) => row >= 0 && row < rows && col >= 0 && col < cols;

export const gameSizes = { chess: CHESS_FILES, xiangqi: XIANGQI_ROWS, go: GO_SIZE };

export function createInitialBoard(game) {
  if (game === 'go') return makeBoard(GO_SIZE, GO_SIZE);

  if (game === 'chess') {
    const board = makeBoard(8, 8);
    const backRank = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    for (let col = 0; col < 8; col += 1) {
      board[position(0, col, 8)] = `b${backRank[col]}`;
      board[position(1, col, 8)] = 'bP';
      board[position(6, col, 8)] = 'wP';
      board[position(7, col, 8)] = `w${backRank[col]}`;
    }
    return board;
  }

  const board = makeBoard(XIANGQI_ROWS, XIANGQI_COLS);
  const backRank = ['R', 'H', 'E', 'A', 'K', 'A', 'E', 'H', 'R'];
  for (let col = 0; col < XIANGQI_COLS; col += 1) {
    board[position(0, col, XIANGQI_COLS)] = `b${backRank[col]}`;
    board[position(9, col, XIANGQI_COLS)] = `r${backRank[col]}`;
  }
  [1, 7].forEach((col) => {
    board[position(2, col, XIANGQI_COLS)] = 'bC';
    board[position(7, col, XIANGQI_COLS)] = 'rC';
  });
  [0, 2, 4, 6, 8].forEach((col) => {
    board[position(3, col, XIANGQI_COLS)] = 'bS';
    board[position(6, col, XIANGQI_COLS)] = 'rS';
  });
  return board;
}

const chessOffsets = {
  N: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
  K: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
};

function chessAttacks(board, from, to) {
  const piece = board[from];
  if (!piece) return false;
  const [fromRow, fromCol] = [Math.floor(from / 8), from % 8];
  const [toRow, toCol] = [Math.floor(to / 8), to % 8];
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;
  const absRow = Math.abs(rowDiff);
  const absCol = Math.abs(colDiff);
  const type = piece[1];

  if (type === 'P') return rowDiff === (piece[0] === 'w' ? -1 : 1) && absCol === 1;
  if (type === 'N') return absRow * absCol === 2;
  if (type === 'K') return Math.max(absRow, absCol) === 1;

  const diagonal = absRow === absCol;
  const straight = rowDiff === 0 || colDiff === 0;
  if ((type === 'B' && !diagonal) || (type === 'R' && !straight) ||
      (type === 'Q' && !diagonal && !straight)) return false;

  const rowStep = Math.sign(rowDiff);
  const colStep = Math.sign(colDiff);
  let row = fromRow + rowStep;
  let col = fromCol + colStep;
  while (row !== toRow || col !== toCol) {
    if (board[position(row, col, 8)]) return false;
    row += rowStep;
    col += colStep;
  }
  return true;
}

function chessKingInCheck(board, side) {
  const king = board.findIndex((piece) => piece === `${side}K`);
  if (king < 0) return true;
  return board.some((piece, index) => piece && piece[0] !== side && chessAttacks(board, index, king));
}

function chessPseudoMoves(board, from, enPassant = null, castling = {}) {
  const piece = board[from];
  if (!piece) return [];
  const side = piece[0];
  const type = piece[1];
  const row = Math.floor(from / 8);
  const col = from % 8;
  const moves = [];
  const add = (r, c) => {
    if (!inside(r, c, 8, 8)) return false;
    const to = position(r, c, 8);
    if (board[to]?.[0] === side || board[to]?.[1] === 'K') return false;
    moves.push({ from, to });
    return !board[to];
  };

  if (type === 'P') {
    const direction = side === 'w' ? -1 : 1;
    const startRow = side === 'w' ? 6 : 1;
    const nextRow = row + direction;
    if (inside(nextRow, col, 8, 8) && !board[position(nextRow, col, 8)]) {
      const oneStep = position(nextRow, col, 8);
      moves.push({ from, to: oneStep, promotion: nextRow === 0 || nextRow === 7 });
      const twoStepRow = row + direction * 2;
      if (row === startRow && !board[position(twoStepRow, col, 8)]) {
        moves.push({ from, to: position(twoStepRow, col, 8), doublePawn: true });
      }
    }
    [-1, 1].forEach((offset) => {
      const targetCol = col + offset;
      if (!inside(nextRow, targetCol, 8, 8)) return;
      const to = position(nextRow, targetCol, 8);
      if ((board[to]?.[0] === (side === 'w' ? 'b' : 'w') && board[to]?.[1] !== 'K') || to === enPassant) {
        moves.push({ from, to, enPassant: to === enPassant });
      }
    });
    return moves;
  }

  if (type === 'N' || type === 'K') {
    chessOffsets[type].forEach(([dr, dc]) => add(row + dr, col + dc));
    if (type === 'K' && row === (side === 'w' ? 7 : 0) && col === 4) {
      const opponent = side === 'w' ? 'b' : 'w';
      if (castling[`${side}K`] && !board[position(row, 5, 8)] && !board[position(row, 6, 8)] &&
          board[position(row, 7, 8)] === `${side}R` &&
          !chessAttackedBy(board, position(row, 4, 8), opponent) &&
          !chessAttackedBy(board, position(row, 5, 8), opponent) &&
          !chessAttackedBy(board, position(row, 6, 8), opponent)) {
        moves.push({ from, to: position(row, 6, 8), castle: 'king' });
      }
      if (castling[`${side}Q`] && !board[position(row, 1, 8)] && !board[position(row, 2, 8)] &&
          !board[position(row, 3, 8)] && board[position(row, 0, 8)] === `${side}R` &&
          !chessAttackedBy(board, position(row, 4, 8), opponent) &&
          !chessAttackedBy(board, position(row, 3, 8), opponent) &&
          !chessAttackedBy(board, position(row, 2, 8), opponent)) {
        moves.push({ from, to: position(row, 2, 8), castle: 'queen' });
      }
    }
    return moves;
  }

  const directions = [];
  if (type === 'B' || type === 'Q') directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  if (type === 'R' || type === 'Q') directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
  directions.forEach(([dr, dc]) => {
    let targetRow = row + dr;
    let targetCol = col + dc;
    while (add(targetRow, targetCol)) {
      targetRow += dr;
      targetCol += dc;
    }
  });
  return moves;
}

function chessAttackedBy(board, target, side) {
  return board.some((piece, index) =>
    piece && piece[0] === side && chessAttacks(board, index, target)
  );
}

function chessLegalMoves(board, from, enPassant, castling) {
  const side = board[from]?.[0];
  return chessPseudoMoves(board, from, enPassant, castling).filter((move) => {
    const next = [...board];
    next[move.to] = next[from];
    next[from] = '';
    if (move.enPassant) next[move.to + (side === 'w' ? 8 : -8)] = '';
    if (move.castle === 'king') {
      next[move.to - 1] = next[move.to + 1];
      next[move.to + 1] = '';
    } else if (move.castle === 'queen') {
      next[move.to + 1] = next[move.to - 2];
      next[move.to - 2] = '';
    }
    return !chessKingInCheck(next, side);
  });
}

function xiangqiPalace(row, col, side) {
  return col >= 3 && col <= 5 && (side === 'r' ? row >= 7 && row <= 9 : row >= 0 && row <= 2);
}

function xiangqiPseudoMoves(board, from) {
  const piece = board[from];
  if (!piece) return [];
  const side = piece[0];
  const type = piece[1];
  const row = Math.floor(from / XIANGQI_COLS);
  const col = from % XIANGQI_COLS;
  const moves = [];
  const add = (r, c) => {
    if (!inside(r, c, XIANGQI_ROWS, XIANGQI_COLS)) return false;
    const to = position(r, c, XIANGQI_COLS);
    if (board[to]?.[0] === side) return false;
    moves.push({ from, to });
    return !board[to];
  };

  if (type === 'K') {
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
      const targetRow = row + dr;
      const targetCol = col + dc;
      if (xiangqiPalace(targetRow, targetCol, side)) add(targetRow, targetCol);
    });
    const opposingKing = board.findIndex((candidate) => candidate === `${side === 'r' ? 'b' : 'r'}K`);
    if (opposingKing >= 0 && opposingKing % XIANGQI_COLS === col) {
      const step = Math.sign(Math.floor(opposingKing / XIANGQI_COLS) - row);
      let clear = true;
      for (let scanRow = row + step; scanRow !== Math.floor(opposingKing / XIANGQI_COLS); scanRow += step) {
        if (board[position(scanRow, col, XIANGQI_COLS)]) clear = false;
      }
      if (clear) moves.push({ from, to: opposingKing });
    }
    return moves;
  }

  if (type === 'A') {
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      if (xiangqiPalace(r, c, side)) add(r, c);
    });
    return moves;
  }
  if (type === 'E') {
    [[-2, -2], [-2, 2], [2, -2], [2, 2]].forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      const crossedRiver = side === 'r' ? r < 5 : r > 4;
      const eye = position(row + dr / 2, col + dc / 2, XIANGQI_COLS);
      if (inside(r, c, XIANGQI_ROWS, XIANGQI_COLS) && !crossedRiver && !board[eye]) add(r, c);
    });
    return moves;
  }
  if (type === 'H') {
    const jumps = [
      [-2, -1, -1, 0], [-2, 1, -1, 0], [2, -1, 1, 0], [2, 1, 1, 0],
      [-1, -2, 0, -1], [1, -2, 0, -1], [-1, 2, 0, 1], [1, 2, 0, 1]
    ];
    jumps.forEach(([dr, dc, legRow, legCol]) => {
      if (!board[position(row + legRow, col + legCol, XIANGQI_COLS)]) add(row + dr, col + dc);
    });
    return moves;
  }
  if (type === 'S') {
    const forward = side === 'r' ? -1 : 1;
    add(row + forward, col);
    const crossedRiver = side === 'r' ? row <= 4 : row >= 5;
    if (crossedRiver) {
      add(row, col - 1);
      add(row, col + 1);
    }
    return moves;
  }
  if (type === 'R' || type === 'C') {
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
      let targetRow = row + dr;
      let targetCol = col + dc;
      let screens = 0;
      while (inside(targetRow, targetCol, XIANGQI_ROWS, XIANGQI_COLS)) {
        const to = position(targetRow, targetCol, XIANGQI_COLS);
        if (type === 'R') {
          if (!add(targetRow, targetCol)) break;
        } else if (screens === 0) {
          if (board[to]) screens = 1;
          else moves.push({ from, to });
        } else if (board[to]) {
          if (board[to][0] !== side) moves.push({ from, to });
          break;
        }
        targetRow += dr;
        targetCol += dc;
      }
    });
  }
  return moves;
}

function xiangqiKingInCheck(board, side) {
  const king = board.findIndex((piece) => piece === `${side}K`);
  if (king < 0) return true;
  return board.some((piece, index) =>
    piece && piece[0] !== side && xiangqiPseudoMoves(board, index).some((move) => move.to === king)
  );
}

function xiangqiLegalMoves(board, from) {
  const side = board[from]?.[0];
  return xiangqiPseudoMoves(board, from).filter((move) => {
    const next = [...board];
    next[move.to] = next[from];
    next[from] = '';
    return !xiangqiKingInCheck(next, side);
  });
}

export function getLegalMoves(game, board, from, state = {}) {
  if (!board?.[from]) return [];
  if (game === 'chess') return chessLegalMoves(board, from, state.enPassant, state.castling);
  if (game === 'xiangqi') return xiangqiLegalMoves(board, from);
  return [];
}

function hasAnyLegalMove(game, board, side, state) {
  return board.some((piece, from) =>
    piece?.[0] === side && getLegalMoves(game, board, from, state).length > 0
  );
}

function getGroup(board, start, color) {
  const group = new Set([start]);
  const liberties = new Set();
  const stack = [start];
  while (stack.length) {
    const index = stack.pop();
    const row = Math.floor(index / GO_SIZE);
    const col = index % GO_SIZE;
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      if (!inside(r, c, GO_SIZE, GO_SIZE)) return;
      const next = position(r, c, GO_SIZE);
      if (!board[next]) liberties.add(next);
      else if (board[next] === color && !group.has(next)) {
        group.add(next);
        stack.push(next);
      }
    });
  }
  return { group, liberties };
}

export function playGoStone(board, index, color, previousBoard = null) {
  if (board[index]) return { error: 'Giao điểm này đã có quân.' };
  const next = [...board];
  next[index] = color;
  let captured = 0;
  const checked = new Set();
  const row = Math.floor(index / GO_SIZE);
  const col = index % GO_SIZE;
  [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
    const r = row + dr;
    const c = col + dc;
    if (!inside(r, c, GO_SIZE, GO_SIZE)) return;
    const neighbor = position(r, c, GO_SIZE);
    if (!next[neighbor] || next[neighbor] === color || checked.has(neighbor)) return;
    const { group, liberties } = getGroup(next, neighbor, next[neighbor]);
    group.forEach((stone) => checked.add(stone));
    if (liberties.size === 0) {
      group.forEach((stone) => {
        next[stone] = '';
        captured += 1;
      });
    }
  });
  if (getGroup(next, index, color).liberties.size === 0) {
    return { error: 'Nước đi tự sát không hợp lệ.' };
  }
  if (previousBoard && next.every((cell, cellIndex) => cell === previousBoard[cellIndex])) {
    return { error: 'Nước đi vi phạm luật Ko.' };
  }
  return { board: next, captured };
}

export function scoreGo(board, komi = 6.5) {
  let black = board.filter((stone) => stone === 'B').length;
  let white = board.filter((stone) => stone === 'W').length + komi;
  const visited = new Set();
  board.forEach((stone, start) => {
    if (stone || visited.has(start)) return;
    const region = new Set([start]);
    const borders = new Set();
    const stack = [start];
    visited.add(start);
    while (stack.length) {
      const index = stack.pop();
      const row = Math.floor(index / GO_SIZE);
      const col = index % GO_SIZE;
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
        const r = row + dr;
        const c = col + dc;
        if (!inside(r, c, GO_SIZE, GO_SIZE)) return;
        const next = position(r, c, GO_SIZE);
        if (board[next]) borders.add(board[next]);
        else if (!visited.has(next)) {
          visited.add(next);
          region.add(next);
          stack.push(next);
        }
      });
    }
    if (borders.size === 1) {
      if (borders.has('B')) black += region.size;
      else white += region.size;
    }
  });
  return { black, white };
}

export function applyBoardMove(game, board, move, state = {}) {
  if (game === 'go') {
    const next = playGoStone(board, move.to, move.side, state.previousBoard);
    if (next.error) return next;
    return { board: next.board, state: { captured: (state.captured || 0) + next.captured, passes: 0 } };
  }

  const legalMoves = getLegalMoves(game, board, move.from, state);
  const legal = legalMoves.find((candidate) => candidate.to === move.to);
  if (!legal) return { error: 'Nước đi không hợp lệ.' };
  const next = [...board];
  const piece = next[move.from];
  const capturedPiece = next[move.to];
  next[move.to] = legal.promotion ? `${piece[0]}Q` : piece;
  next[move.from] = '';
  const nextState = { ...state };

  if (game === 'chess') {
    if (legal.enPassant) next[move.to + (piece[0] === 'w' ? 8 : -8)] = '';
    if (legal.castle === 'king') {
      next[move.to - 1] = next[move.to + 1];
      next[move.to + 1] = '';
    } else if (legal.castle === 'queen') {
      next[move.to + 1] = next[move.to - 2];
      next[move.to - 2] = '';
    }
    if (piece[1] === 'K') {
      nextState.castling = { ...state.castling, [`${piece[0]}K`]: false, [`${piece[0]}Q`]: false };
    }
    const clearRookRight = (color, square) => {
      const rookStart = color === 'w' ? 56 : 0;
      if (square === rookStart) nextState.castling = { ...nextState.castling, [`${color}Q`]: false };
      if (square === rookStart + 7) nextState.castling = { ...nextState.castling, [`${color}K`]: false };
    };
    if (piece[1] === 'R') clearRookRight(piece[0], move.from);
    if (capturedPiece?.[1] === 'R') clearRookRight(capturedPiece[0], move.to);
    if (legal.castle) {
      const rookStart = piece[0] === 'w' ? 56 : 0;
      clearRookRight(piece[0], legal.castle === 'king' ? rookStart + 7 : rookStart);
    }
    nextState.enPassant = legal.doublePawn ? (move.from + move.to) / 2 : null;
  }

  return { board: next, state: nextState };
}

export function getMoveResult(game, board, sideToMove, state = {}) {
  if (game === 'go') {
    if ((state.passes || 0) < 2) return null;
    const score = scoreGo(board);
    return {
      winner: score.black === score.white ? 'draw' : score.black > score.white ? 'B' : 'W',
      reason: `Đếm đất: Đen ${score.black}, Trắng ${score.white}`
    };
  }
  if (hasAnyLegalMove(game, board, sideToMove, state)) return null;
  const inCheck = game === 'chess'
    ? chessKingInCheck(board, sideToMove)
    : xiangqiKingInCheck(board, sideToMove);
  if (game === 'chess' && !inCheck) return { winner: 'draw', reason: 'Hòa cờ (stalemate)' };
  return {
    winner: sideToMove === 'w' || sideToMove === 'r' ? 'b' : 'w',
    reason: inCheck ? 'Chiếu bí' : 'Hết nước đi hợp lệ'
  };
}

export function getMoveSide(game, piece) {
  if (game === 'go') return piece;
  return piece?.[0] || '';
}

export function getGameSymbols(game) {
  if (game === 'chess') {
    return { wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙', bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟' };
  }
  if (game === 'xiangqi') {
    return { rK: '帥', rA: '仕', rE: '相', rH: '傌', rR: '俥', rC: '炮', rS: '兵', bK: '將', bA: '士', bE: '象', bH: '馬', bR: '車', bC: '砲', bS: '卒' };
  }
  return {};
}

export function getInitialGameState(game) {
  if (game === 'chess') {
    return { castling: { wK: true, wQ: true, bK: true, bQ: true }, enPassant: null };
  }
  if (game === 'go') return { captured: 0, passes: 0 };
  return {};
}
