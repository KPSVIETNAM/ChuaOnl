import React from 'react';

const TOTAL_CELLS = 225; // 15 * 15

export default function CaroBoard({ board, winningLine, status, onCellClick, mySymbol = 'X' }) {
  const visualOrder = Array.from({ length: TOTAL_CELLS }, (_, index) => index);
  if (mySymbol === 'O') visualOrder.reverse();

  return (
    <div className="caro-board">
      {board && board.length === TOTAL_CELLS ? (
        visualOrder.map((idx) => {
          const cell = board[idx];
          const isWinningCell = winningLine.includes(idx);
          return (
            <button 
              key={idx} 
              className={`caro-cell ${cell} ${isWinningCell ? 'winning-cell' : ''}`}
              onClick={() => onCellClick(idx)}
              disabled={status !== 'playing'}
            >
              {cell}
            </button>
          );
        })
      ) : (
        Array(TOTAL_CELLS).fill('').map((_, idx) => (
          <div key={idx} className="caro-cell"></div>
        ))
      )}
    </div>
  );
}