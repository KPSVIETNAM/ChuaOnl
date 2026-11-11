import React from 'react';

const TOTAL_CELLS = 225; // 15 * 15

export default function CaroBoard({ board, winningLine, status, onCellClick }) {
  return (
    <div className="caro-board">
      {board && board.length === TOTAL_CELLS ? (
        board.map((cell, idx) => {
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