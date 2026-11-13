import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onValue, push, ref, remove, runTransaction, set, update } from 'firebase/database';
import { db } from '../firebase';
import { revokePendingGameInvites, sendGameInvite } from './boardGameInvites';
import FloatingCommunityChat from './FloatingCommunityChat';
import BoardGameCommonChat from './BoardGameCommonChat';
import GameInviteModal from './GameInviteModal';
import { GAME_STATUSES, updateGamePresence } from './gamePresence';
import {
  applyBoardMove,
  createInitialBoard,
  getCheckedKingIndex,
  gameSizes,
  getGameSymbols,
  getInitialGameState,
  getLegalMoves,
  getMoveResult,
  getMoveSide
} from './gameRules';

const GAME_INFO = {
  caro: { title: 'Cờ Caro', icon: '❌', namespace: 'CoCaro', colors: ['X', 'O'], colorNames: { X: 'X', O: 'O' } },
  chess: { title: 'Cờ vua', icon: '♟️', namespace: 'CoVua', colors: ['w', 'b'], colorNames: { w: 'Trắng', b: 'Đen' } },
  xiangqi: { title: 'Cờ tướng', icon: '🀄', namespace: 'CoTuong', colors: ['r', 'b'], colorNames: { r: 'Đỏ', b: 'Đen' } },
  go: { title: 'Cờ vây', icon: '⚫', namespace: 'covay', colors: ['B', 'W'], colorNames: { B: 'Đen', W: 'Trắng' } }
};

function getPlayerColor(game, playerCount) {
  return GAME_INFO[game].colors[playerCount % 2];
}

function GameBoard({ game, board, onMove, turn, myColor, gameState, canMove, checkedKingIndex, winningLine = [] }) {
  const [selection, setSelection] = useState(null);
  const selected = selection?.board === board ? selection.index : null;
  const symbols = useMemo(() => getGameSymbols(game), [game]);
  const size = gameSizes[game];
  const legalMoves = selected === null ? [] : getLegalMoves(game, board, selected, gameState);
  const visualOrder = useMemo(() => {
    const indices = Array.from({ length: board.length }, (_, index) => index);
    return game !== 'caro' && myColor === GAME_INFO[game].colors[1] ? indices.reverse() : indices;
  }, [board.length, game, myColor]);

  const onCellClick = (index) => {
    if (!canMove) return;
    if (game === 'go' || game === 'caro') {
      if (turn === myColor) onMove({ to: index });
      return;
    }
    if (selected !== null && legalMoves.some((move) => move.to === index)) {
      onMove({ from: selected, to: index });
      setSelection(null);
      return;
    }
    if (board[index] && getMoveSide(game, board[index]) === myColor && turn === myColor) {
      setSelection({ index, board });
    } else {
      setSelection(null);
    }
  };

  return (
    <div className={`board-game-board ${game}`} role="grid" aria-label={`Bàn ${GAME_INFO[game].title}`}>
      {visualOrder.map((index) => {
        const piece = board[index];
        const row = Math.floor(index / size);
        const col = index % size;
        const isSelected = selected === index;
        const isLegal = game === 'go' || game === 'caro'
          ? !piece
          : legalMoves.some((move) => move.to === index);
        return (
          <button
            type="button"
            key={index}
            className={[
              'board-game-cell',
              game === 'chess' && (row + col) % 2 === 1 ? 'dark-square' : '',
              game === 'caro' ? 'caro-cell' : '',
              game === 'caro' && winningLine.includes(index) ? 'caro-winning-cell' : '',
              game === 'go' ? 'go-point' : '',
              game === 'xiangqi' ? 'xiangqi-point' : '',
              isSelected ? 'selected' : '',
              index === checkedKingIndex ? 'king-in-check' : '',
              isLegal ? 'legal-move' : ''
            ].filter(Boolean).join(' ')}
            onClick={() => onCellClick(index)}
            disabled={!canMove || turn !== myColor}
            aria-label={`Hàng ${row + 1}, cột ${col + 1}${piece ? `, ${piece}` : ''}`}
          >
            {piece && game === 'go' && <span className={`go-stone ${piece === 'B' ? 'black-stone' : 'white-stone'}`} />}
            {piece && game === 'caro' && <span className={`caro-symbol ${piece}`}>{piece}</span>}
            {piece && game !== 'go' && game !== 'caro' && <span className={`game-piece ${piece[0] === 'w' || piece[0] === 'r' ? 'light-piece' : 'dark-piece'}`}>{symbols[piece]}</span>}
            {!piece && isLegal && game !== 'go' && game !== 'caro' && <span className="move-dot" />}
          </button>
        );
      })}
    </div>
  );
}

function VictoryFireworks() {
  const bursts = [
    { left: '22%', top: '28%', delay: '0s' },
    { left: '76%', top: '34%', delay: '.45s' },
    { left: '50%', top: '68%', delay: '.9s' }
  ];

  return (
    <div className="victory-overlay" aria-label="Pháo hoa chúc mừng chiến thắng">
      {bursts.map((burst, burstIndex) => (
        <div
          className="firework-burst"
          key={burst.left}
          style={{ left: burst.left, top: burst.top, animationDelay: burst.delay }}
        >
          {Array.from({ length: 12 }, (_, index) => (
            <span
              key={index}
              style={{
                '--particle-angle': `${index * 30}deg`,
                '--particle-delay': `${burstIndex * 0.45}s`,
                '--particle-color': ['#fbbf24', '#fb7185', '#38bdf8', '#c084fc'][index % 4]
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function BoardGameRoom({ game, currentUser, activeUsers = {}, roomId: initialRoomId, onRoomLeave, setNotice }) {
  const info = GAME_INFO[game];
  const username = currentUser?.username;
  const fullName = currentUser?.fullName || username || 'Đạo hữu';
  const basePath = `board_games/${game}`;
  const [activeRoomId, setActiveRoomId] = useState(null);
  const roomId = initialRoomId || activeRoomId;
  const [roomData, setRoomData] = useState(null);
  const [lobby, setLobby] = useState({});
  const [status, setStatus] = useState(GAME_STATUSES.waiting);
  const [stats, setStats] = useState({ wins: 0, losses: 0 });
  const [chatText, setChatText] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const chatRef = useRef(null);
  const lastCheckSoundRef = useRef(null);

  useEffect(() => {
    if (!username) return undefined;
    const lobbyRef = ref(db, `${basePath}/lobby/${username}`);
    update(lobbyRef, {
      username,
      fullName,
      status: initialRoomId ? 'dang_dau' : 'dang_doi',
      roomId: initialRoomId || null,
      matchedRoomId: initialRoomId || null
    });
    const statsRef = ref(db, `users/${username}/${game}Stats`);
    const unsubscribe = onValue(statsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setStats({ wins: data.wins || 0, losses: data.losses || 0 });
    });
    return () => {
      remove(lobbyRef);
      unsubscribe();
    };
  }, [basePath, game, fullName, initialRoomId, username]);

  useEffect(() => {
    updateGamePresence(username, game, status)
      .catch((error) => console.error('Lỗi cập nhật trạng thái Kỳ Viện:', error));
  }, [game, status, username]);

  useEffect(() => {
    const lobbyRef = ref(db, `${basePath}/lobby`);
    return onValue(lobbyRef, async (snapshot) => {
      const players = snapshot.val() || {};
      setLobby(players);
      const myEntry = players[username];
      if (myEntry?.matchedRoomId === roomId && myEntry.status) {
        setStatus(myEntry.status);
      }
      if (myEntry?.matchedRoomId && myEntry.matchedRoomId !== roomId) {
        setActiveRoomId(myEntry.matchedRoomId);
        setStatus(myEntry.status || GAME_STATUSES.waiting);
      }

      if (myEntry?.status !== GAME_STATUSES.searching || roomId) return;
      const opponentKey = Object.keys(players).find((key) =>
        key !== username &&
        players[key].status === GAME_STATUSES.searching &&
        !players[key].matchedRoomId
      );
      if (!opponentKey || username > opponentKey) return;

      const newRoomId = `room_${Date.now()}_${username}`;
      const opponent = players[opponentKey];
      await set(ref(db, `${basePath}/rooms/${newRoomId}`), {
        players: {
          [username]: { fullName, symbol: getPlayerColor(game, 0), ready: false },
          [opponentKey]: { fullName: opponent.fullName || opponentKey, symbol: getPlayerColor(game, 1), ready: false }
        },
        board: createInitialBoard(game),
        gameState: getInitialGameState(game),
        turn: '',
        status: 'waiting',
        chat: {}
      });
      await update(ref(db, `${basePath}/lobby/${username}`), { status: 'dang_dau', roomId: newRoomId, matchedRoomId: newRoomId });
      await update(ref(db, `${basePath}/lobby/${opponentKey}`), { status: 'dang_dau', roomId: newRoomId, matchedRoomId: newRoomId });
      setActiveRoomId(newRoomId);
      setStatus(GAME_STATUSES.playing);
    });
  }, [basePath, game, fullName, roomId, username]);

  useEffect(() => {
    if (!roomId) {
      return undefined;
    }
    return onValue(ref(db, `${basePath}/rooms/${roomId}`), (snapshot) => {
      setRoomData(snapshot.val());
    });
  }, [basePath, roomId]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [roomData?.chat]);

  const players = roomData?.players || {};
  const playerKeys = Object.keys(players);
  const myPlayer = players[username];
  const opponentPlayer = playerKeys.map((key) => players[key]).find((player) => player !== myPlayer);
  const isMyRuleRequest = myPlayer?.ruleRequest || false;
  const isOpponentRuleRequest = opponentPlayer?.ruleRequest || false;
  const isMyVictory = roomData?.status === 'finished' && roomData.winner === myPlayer?.symbol;
  const isMyTurn = roomData?.turn === username;
  const opponentName = playerKeys.find((key) => key !== username);
  const checkedKingIndex = roomData?.status === 'playing'
    ? getCheckedKingIndex(game, roomData.board || [], players[roomData.turn]?.symbol)
    : -1;

  useEffect(() => {
    if (checkedKingIndex < 0 || !roomData?.board) {
      lastCheckSoundRef.current = null;
      return;
    }

    const positionKey = `${roomId}:${roomData.turn}:${roomData.board.join('|')}`;
    if (lastCheckSoundRef.current === positionKey) return;
    lastCheckSoundRef.current = positionKey;

    const bell = new Audio('/audio/chuong1.mp3');
    bell.play().catch((error) => console.warn('Không thể phát chuông báo chiếu tướng:', error));
  }, [checkedKingIndex, roomData?.board, roomData?.turn, roomData?.status, roomId]);

  const updateLobbyStatus = async (nextStatus, matchedRoomId = null) => {
    if (!username) return;
    setStatus(nextStatus);
    await update(ref(db, `${basePath}/lobby/${username}`), {
      status: nextStatus,
      roomId: nextStatus === 'dang_doi' ? null : roomId,
      matchedRoomId
    });
  };

  const handleRandomMatch = async () => {
    setActiveRoomId(null);
    setStatus(GAME_STATUSES.searching);
    await update(ref(db, `${basePath}/lobby/${username}`), {
      status: 'dang_tim_ghep',
      roomId: null,
      matchedRoomId: null
    });
  };

  const handleCancelMatch = () => updateLobbyStatus('dang_doi');

  const handleInvite = async (targetUsername, targetUser) => {
    if (targetUser.currentScreen === 'TinhTamDien') {
      setNotice?.(`Đạo hữu ${targetUser.fullName || targetUsername} đang tịnh tâm, không thể quấy rầy!`);
      return;
    }
    let targetRoomId = roomId;
    if (!roomData || roomData.status !== 'waiting' || !myPlayer || playerKeys.length !== 1) {
      targetRoomId = `room_${Date.now()}_${username}`;
      await set(ref(db, `${basePath}/rooms/${targetRoomId}`), {
        players: { [username]: { fullName, symbol: getPlayerColor(game, 0), ready: false } },
        board: createInitialBoard(game),
        gameState: getInitialGameState(game),
        turn: '',
        status: 'waiting',
        chat: {},
        invitedUsers: { [targetUsername]: true },
        inviteStatus: { [targetUsername]: 'pending' }
      });
      setActiveRoomId(targetRoomId);
      setStatus(GAME_STATUSES.waiting);
      await update(ref(db, `${basePath}/lobby/${username}`), {
        status: 'dang_doi', roomId: targetRoomId, matchedRoomId: targetRoomId
      });
    } else {
      await update(ref(db, `${basePath}/rooms/${targetRoomId}`), {
        [`invitedUsers/${targetUsername}`]: true,
        [`inviteStatus/${targetUsername}`]: 'pending'
      });
    }

    await update(ref(db, `${basePath}/lobby/${username}`), {
      status: 'dang_doi',
      roomId: targetRoomId,
      matchedRoomId: targetRoomId
    });
    await sendGameInvite(targetUsername, {
      game,
      roomId: targetRoomId,
      fromUsername: username,
      fromFullName: fullName
    });
  };

  const handleToggleReady = async () => {
    if (!roomData || !myPlayer) return;
    const updatedPlayers = { ...players, [username]: { ...myPlayer, ready: !myPlayer.ready } };
    const allReady = Object.keys(updatedPlayers).length === 2 &&
      Object.values(updatedPlayers).every((player) => player.ready);
    await update(ref(db, `${basePath}/rooms/${roomId}`), {
      players: updatedPlayers,
      status: allReady ? 'playing' : 'waiting',
      turn: allReady ? playerKeys[0] : ''
    });
  };

  const recordResult = (winner, loser) => {
    if (!winner || !loser) return;
    runTransaction(ref(db, `users/${winner}/${game}Stats/wins`), (value) => (value || 0) + 1);
    runTransaction(ref(db, `users/${loser}/${game}Stats/losses`), (value) => (value || 0) + 1);
  };

  const finishMove = async (nextBoard, nextState, nextTurn, result) => {
    const winnerUsername = result?.winner && result.winner !== 'draw'
      ? playerKeys.find((key) => players[key]?.symbol === result.winner)
      : null;
    await update(ref(db, `${basePath}/rooms/${roomId}`), {
      board: nextBoard,
      gameState: nextState,
      turn: result ? '' : nextTurn,
      status: result ? 'finished' : 'playing',
      winner: result?.winner || null,
      resultReason: result?.reason || null,
      winningLine: result?.winningLine || []
    });
    if (winnerUsername) recordResult(winnerUsername, playerKeys.find((key) => key !== winnerUsername));
    if (result) updateLobbyStatus('dang_doi');
  };

  const handleMove = async (move) => {
    if (!roomData || roomData.status !== 'playing' || !isMyTurn) return;
    const currentSymbol = myPlayer?.symbol;
    if (game === 'go' || game === 'caro') {
      const previousState = roomData.gameState || {};
      const result = applyBoardMove(game, roomData.board, { ...move, side: currentSymbol }, {
        ...previousState,
        ...(game === 'caro' ? { blockRule: roomData.blockRule || false } : {})
      });
      if (result.error) {
        setNotice?.(result.error);
        return;
      }
      const nextState = game === 'go'
        ? { ...result.state, previousBoard: roomData.board }
        : { ...result.state, blockRule: roomData.blockRule || false };
      const nextTurn = opponentName;
      const gameResult = getMoveResult(game, result.board, players[nextTurn]?.symbol, nextState);
      await finishMove(result.board, nextState, nextTurn, gameResult);
      return;
    }

    if (getMoveSide(game, roomData.board[move.from]) !== currentSymbol) return;
    const applied = applyBoardMove(game, roomData.board, move, roomData.gameState || {});
    if (applied.error) {
      setNotice?.(applied.error);
      return;
    }
    const nextTurn = opponentName;
    const gameResult = getMoveResult(game, applied.board, players[nextTurn]?.symbol, applied.state);
    await finishMove(applied.board, applied.state, nextTurn, gameResult);
  };

  const handlePass = async () => {
    if (!roomData || roomData.status !== 'playing' || !isMyTurn) return;
    const nextState = { ...(roomData.gameState || {}), passes: (roomData.gameState?.passes || 0) + 1, previousBoard: null };
    const nextTurn = opponentName;
    const gameResult = getMoveResult(game, roomData.board, players[nextTurn]?.symbol, nextState);
    await finishMove(roomData.board, nextState, nextTurn, gameResult);
  };

  const handleToggleRuleRequest = async () => {
    if (game !== 'caro' || !roomData || !myPlayer) return;
    const updatedPlayers = {
      ...players,
      [username]: { ...myPlayer, ruleRequest: !myPlayer.ruleRequest }
    };
    const allAgreed = playerKeys.length === 2 &&
      playerKeys.every((key) => updatedPlayers[key]?.ruleRequest);
    if (allAgreed) {
      playerKeys.forEach((key) => {
        updatedPlayers[key] = { ...updatedPlayers[key], ruleRequest: false };
      });
    }
    await update(ref(db, `${basePath}/rooms/${roomId}`), {
      players: updatedPlayers,
      ...(allAgreed ? { blockRule: !roomData.blockRule } : {})
    });
  };

  const handleRematch = async () => {
    const updatedPlayers = {
      ...players,
      [username]: { ...myPlayer, rematchRequested: true }
    };
    const allRequested = playerKeys.length === 2 && playerKeys.every((key) => updatedPlayers[key]?.rematchRequested);
    if (!allRequested) {
      await update(ref(db, `${basePath}/rooms/${roomId}`), { players: updatedPlayers });
      return;
    }
    const resetPlayers = {
      [playerKeys[0]]: { ...players[playerKeys[0]], symbol: getPlayerColor(game, 0), ready: true, rematchRequested: false },
      [playerKeys[1]]: { ...players[playerKeys[1]], symbol: getPlayerColor(game, 1), ready: true, rematchRequested: false }
    };
    await update(ref(db, `${basePath}/rooms/${roomId}`), {
      players: resetPlayers,
      board: createInitialBoard(game),
      gameState: getInitialGameState(game),
      status: 'playing',
      turn: playerKeys[0],
      winner: null,
      resultReason: null,
      winningLine: []
    });
    setStatus(GAME_STATUSES.playing);
  };

  const handleLeaveRoom = async () => {
    if (roomId && roomData) {
      const roomRef = ref(db, `${basePath}/rooms/${roomId}`);
      const leaveResult = await runTransaction(roomRef, (currentRoom) => {
        if (!currentRoom) return currentRoom;
        const updatedPlayers = { ...(currentRoom.players || {}) };
        delete updatedPlayers[username];

        if (currentRoom.status === 'playing' || currentRoom.status === 'waiting') {
          return {
            ...currentRoom,
            status: 'cancelled',
            resultReason: `${fullName} đã rời phòng. Lời mời đang chờ đã được thu hồi.`,
            players: updatedPlayers
          };
        }
        if (!Object.keys(updatedPlayers).length) return null;
        return { ...currentRoom, players: updatedPlayers };
      }, { applyLocally: false });

      const latestRoom = leaveResult.snapshot.val();
      if (latestRoom) await revokePendingGameInvites(game, roomId, latestRoom);
    }
    await update(ref(db, `${basePath}/lobby/${username}`), { status: 'dang_doi', roomId: null, matchedRoomId: null });
    setActiveRoomId(null);
    setRoomData(null);
    setStatus(GAME_STATUSES.waiting);
    onRoomLeave?.();
  };

  const sendChat = async (event) => {
    event.preventDefault();
    const text = chatText.trim();
    if (!text || !roomId) return;
    await push(ref(db, `${basePath}/rooms/${roomId}/chat`), {
      username,
      sender: fullName,
      text: text.slice(0, 300),
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setChatText('');
  };

  const moveTurn = roomData?.players?.[roomData.turn]?.fullName || 'Đang chờ';
  const score = game === 'go' ? (roomData?.status === 'finished' ? ` • ${roomData.resultReason}` : ` • Đã bắt ${roomData?.gameState?.captured || 0} quân`) : '';

  return (
    <section className="board-game-room">
      <header className="board-game-header">
        <div className="board-game-header-spacer" aria-hidden="true" />
        <h2>{info.icon} KỲ VIỆN {info.title.toLocaleUpperCase('vi-VN')}</h2>
        <div className="board-game-header-right">
          <span>{fullName} · Thắng {stats.wins} / Thua {stats.losses}</span>
          <div className="board-game-actions">
            {status !== 'dang_tim_ghep' && (!roomId || (roomData?.status === 'waiting' && myPlayer && playerKeys.length < 2)) && (
              <button type="button" onClick={() => setInviteOpen(true)}>✉️ Mời bạn</button>
            )}
            {!roomId && status !== 'dang_tim_ghep' && (
              <button type="button" className="primary" onClick={handleRandomMatch}>🎲 Ghép ngẫu nhiên</button>
            )}
            {status === 'dang_tim_ghep' && <button type="button" className="danger" onClick={handleCancelMatch}>Hủy tìm trận</button>}
            {roomId && <button type="button" onClick={handleLeaveRoom}>← Rời trận</button>}
          </div>
        </div>
      </header>

      {!roomId ? (
        <div className="board-game-lobby-layout">
          <div className="board-game-lobby">
            <p>{status === 'dang_tim_ghep' ? 'Đang tìm đối thủ...' : 'Chọn ghép ngẫu nhiên hoặc mời đạo hữu để bắt đầu.'}</p>
            <h3>Đạo hữu đang ở Kỳ Viện</h3>
            <div className="board-game-lobby-list">
              {Object.entries(lobby).filter(([key]) => key !== username).map(([key, player]) => (
                <span key={key}>{player.fullName || key} · {player.status === 'dang_tim_ghep' ? 'Đang tìm trận' : 'Đang chờ'}</span>
              ))}
            </div>
          </div>
          <BoardGameCommonChat currentUser={currentUser} />
        </div>
      ) : !roomData ? (
        <div className="board-game-lobby"><p>Đang kết nối phòng chơi...</p></div>
      ) : (
        <>
          <div className="board-game-status">
            <div className="game-players">
              {playerKeys.map((key) => (
                <span key={key} className={players[key].ready ? 'ready' : ''}>
                  {info.colorNames[players[key].symbol]} · {players[key].fullName}{key === username ? ' (Bạn)' : ''}
                </span>
              ))}
              {roomData.invitedUsers && Object.keys(roomData.invitedUsers).length > 0 && (
                <div className="game-invites">
                  <strong>Lời mời:</strong>
                  {Object.keys(roomData.invitedUsers).map((invitedUsername) => {
                    const inviteStatus = roomData.inviteStatus?.[invitedUsername] || 'pending';
                    const inviteLabels = {
                      pending: 'Đang mời',
                      declined: 'Đã từ chối',
                      accepted: 'Đã vào phòng',
                      expired: 'Đã quá hạn',
                      revoked: 'Đã thu hồi'
                    };
                    return (
                      <span key={invitedUsername} className={`invite-${inviteStatus}`}>
                        {lobby[invitedUsername]?.fullName || invitedUsername}: {inviteLabels[inviteStatus] || inviteStatus}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            {roomData.status === 'waiting' && myPlayer && (
              <button type="button" className="primary" onClick={handleToggleReady}>
                {myPlayer.ready ? 'Hủy sẵn sàng' : 'Sẵn sàng'}
              </button>
            )}
            {game === 'caro' && playerKeys.length === 2 && (
              <div className="caro-rule-box">
                <span>Chặn hai đầu: <b>{roomData.blockRule ? 'Bật' : 'Tắt'}</b></span>
                <button type="button" onClick={handleToggleRuleRequest}>
                  {isMyRuleRequest ? '✓ Đã đồng ý' : isOpponentRuleRequest ? 'Đồng ý đổi' : 'Đề xuất đổi'}
                </button>
                {isOpponentRuleRequest && !isMyRuleRequest && <small>Đối thủ đề xuất đổi luật</small>}
              </div>
            )}
            {roomData.status === 'playing' && (
              <strong>
                {isMyTurn
                  ? game === 'caro' ? 'Đến lượt bạn — chọn ô trống' : 'Đến lượt bạn — chọn quân rồi chọn ô xanh'
                  : `Lượt của ${moveTurn}`}
                {score}
              </strong>
            )}
            {checkedKingIndex >= 0 && <strong className="check-warning">⚠️ Chiếu tướng!</strong>}
            {roomData.status === 'waiting' && (
              <p className="game-help">
                {!myPlayer
                  ? 'Bạn không có trong danh sách người chơi của phòng này.'
                  : playerKeys.length < 2
                    ? 'Đang chờ người chơi thứ hai tham gia phòng.'
                    : myPlayer.ready
                      ? 'Bạn đã sẵn sàng. Chờ đối thủ bấm Sẵn sàng để bắt đầu.'
                      : game === 'caro'
                        ? 'Cả hai người chơi cần bấm Sẵn sàng; X đi trước.'
                        : 'Cả hai người chơi cần bấm Sẵn sàng; cờ Trắng đi trước.'}
              </p>
            )}
            {roomData.status === 'finished' && (
              <div className="game-result">
                <strong>
                  {roomData.winner === 'draw'
                    ? '🤝 Hòa!'
                    : roomData.winner === myPlayer?.symbol ? '🎉 Bạn thắng!' : `🏁 ${roomData.players?.[playerKeys.find((key) => players[key].symbol === roomData.winner)]?.fullName || 'Đối thủ'} thắng`}
                </strong>
                <span>{roomData.resultReason}</span>
                <button
                  type="button"
                  className={`primary rematch-button ${isMyVictory ? 'victory-rematch' : ''}`}
                  onClick={handleRematch}
                >
                  {myPlayer?.rematchRequested ? 'Đã yêu cầu chơi lại' : '🔄 Chơi lại'}
                </button>
              </div>
            )}
            {roomData.status === 'cancelled' && <strong className="cancelled-text">Ván đấu đã kết thúc. {roomData.resultReason}</strong>}
          </div>

          <div className="board-game-content">
            <div className="board-game-board-wrap">
              {roomData.status === 'waiting' && playerKeys.length < 2 && <p>Đang chờ người chơi thứ hai...</p>}
              <GameBoard
                game={game}
                board={roomData.board || createInitialBoard(game)}
                turn={roomData.players?.[roomData.turn]?.symbol}
                myColor={myPlayer?.symbol}
                gameState={roomData.gameState || {}}
                canMove={roomData.status === 'playing'}
                checkedKingIndex={checkedKingIndex}
                winningLine={roomData.winningLine || []}
                onMove={handleMove}
              />
              {isMyVictory && <VictoryFireworks />}
              {game === 'go' && roomData.status === 'playing' && (
                <button type="button" className="pass-btn" onClick={handlePass} disabled={!isMyTurn}>Bỏ lượt</button>
              )}
            </div>

            <aside className="board-game-chat">
              <h3>💬 Trò chuyện phòng cờ</h3>
              <div className="board-game-messages" ref={chatRef}>
                {Object.entries(roomData.chat || {}).map(([id, message]) => (
                  <div key={id} className={`board-game-message ${message.username === username ? 'mine' : ''}`}>
                    <b>{message.sender}</b><small>{message.time}</small><p>{message.text}</p>
                  </div>
                ))}
                {!roomData.chat && <p className="empty-chat">Chưa có tin nhắn.</p>}
              </div>
              <form onSubmit={sendChat}>
                <input value={chatText} onChange={(event) => setChatText(event.target.value)} maxLength={300} placeholder="Nhập tin nhắn..." />
                <button type="submit">Gửi</button>
              </form>
            </aside>
          </div>
        </>
      )}

      {inviteOpen && (
        <GameInviteModal
          activeUsers={activeUsers}
          username={username}
          gameName={info.title}
          disabledUsers={Object.fromEntries(Object.entries(roomData?.invitedUsers || {})
            .filter(([invitedUsername]) => {
              const inviteStatus = roomData?.inviteStatus?.[invitedUsername];
              return !inviteStatus || inviteStatus === 'pending' || inviteStatus === 'accepted';
            })
            .map(([invitedUsername]) => [invitedUsername, true]))}
          onInviteUser={handleInvite}
          onClose={() => setInviteOpen(false)}
        />
      )}
      <FloatingCommunityChat currentUser={currentUser} />

      <style>{`
        .board-game-room { max-width: 1100px; margin: 0 auto; padding: 14px; border-radius: 14px; background: #171d2b; color: #f8fafc; }
        .board-game-header, .board-game-actions, .board-game-status, .game-players { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
        .board-game-header { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); margin-bottom: 12px; }
        .board-game-header-spacer { min-width: 0; }
        .board-game-header h2 { grid-column: 2; grid-row: 1; align-self: center; margin: 0; color: #ffcf70; font-size: 20px; text-align: center; white-space: nowrap; }
        .board-game-header-right { grid-column: 3; grid-row: 1; justify-self: end; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .board-game-header-right > span, .board-game-lobby p { color: #cbd5e1; font-size: 13px; }
        .board-game-lobby-layout { display: flex; align-items: stretch; justify-content: center; gap: 16px; flex-wrap: wrap; }
        .board-game-lobby-layout .board-game-lobby { flex: 1 1 420px; }
        .board-game-common-chat { width: min(100%, 340px) !important; height: 360px !important; }
        .board-game-actions { justify-content: flex-end; }
        .board-game-room button { border: 0; border-radius: 7px; padding: 8px 12px; background: #334155; color: white; font-weight: 700; cursor: pointer; }
        .board-game-room button:disabled { cursor: default; }
        .board-game-room button.primary { background: #047857; }
        .board-game-room button.danger { background: #b91c1c; }
        .board-game-status { background: #202737; padding: 10px; border-radius: 9px; margin-bottom: 12px; }
        .game-players { justify-content: flex-start; }
        .game-players span { padding: 6px 9px; background: #334155; border-radius: 20px; font-size: 12px; }
        .game-players span.ready { background: #065f46; }
        .game-invites { flex-basis: 100%; display: flex; align-items: center; flex-wrap: wrap; gap: 7px; color: #cbd5e1; font-size: 11px; }
        .game-invites span { padding: 4px 8px; border-radius: 12px; background: #334155; }
        .game-invites .invite-pending { color: #fde68a; background: #713f12; }
        .game-invites .invite-declined, .game-invites .invite-revoked, .game-invites .invite-expired { color: #fecaca; background: #7f1d1d; }
        .game-invites .invite-accepted { color: #a7f3d0; background: #065f46; }
        .board-game-status strong { color: #fbbf24; font-size: 13px; }
        .board-game-status .game-help { flex-basis: 100%; margin: 0; color: #cbd5e1; font-size: 12px; text-align: left; }
        .game-result { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .game-result span { color: #cbd5e1; font-size: 12px; }
        .game-result .rematch-button { padding: 8px 13px; }
        .game-result .victory-rematch { position: relative; padding: 12px 22px; border: 2px solid #fde68a; background: linear-gradient(135deg, #f59e0b, #b45309); color: #fff; font-size: 16px; box-shadow: 0 0 10px #fbbf24, 0 0 24px #f59e0b99; animation: victory-button-pulse 1s ease-in-out infinite alternate; }
        .game-result .victory-rematch:hover { filter: brightness(1.2); transform: scale(1.04); }
        @keyframes victory-button-pulse { to { box-shadow: 0 0 18px #fde68a, 0 0 36px #f59e0b; transform: scale(1.06); } }
        .victory-overlay { position: absolute; z-index: 4; inset: 0; overflow: hidden; border-radius: 6px; background: #02061755; pointer-events: none; animation: victory-darken .7s ease-out both; }
        @keyframes victory-darken { from { background: transparent; } to { background: #02061766; } }
        .firework-burst { position: absolute; width: 1px; height: 1px; animation: firework-position 2.4s ease-in-out infinite; }
        .firework-burst span { position: absolute; top: 0; left: 0; width: 6px; height: 6px; border-radius: 50%; background: var(--particle-color); box-shadow: 0 0 8px 2px var(--particle-color); opacity: 0; animation: firework-particle 2.4s ease-out infinite; animation-delay: var(--particle-delay); }
        .firework-burst span:nth-child(3n) { animation-delay: calc(var(--particle-delay) + .12s); }
        .firework-burst span:nth-child(3n + 1) { animation-delay: calc(var(--particle-delay) + .24s); }
        @keyframes firework-position { 0%, 100% { opacity: 0; } 12%, 78% { opacity: 1; } }
        @keyframes firework-particle {
          0%, 15% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--particle-angle)) translateY(0) scale(.3); }
          30% { opacity: 1; }
          65%, 100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--particle-angle)) translateY(-48px) scale(.15); }
        }
        .cancelled-text { color: #fca5a5 !important; }
        .board-game-content { display: flex; justify-content: center; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .board-game-board-wrap { position: relative; width: min(100%, 560px); text-align: center; }
        .board-game-board { display: grid; width: min(100%, 560px); aspect-ratio: 1; margin: 0 auto; overflow: hidden; border: 5px solid #6b472b; background: #d6aa66; box-shadow: 0 6px 18px #0008; }
        .board-game-board.chess { grid-template-columns: repeat(8, 1fr); border-color: #57391f; }
        .board-game-board.caro { grid-template-columns: repeat(15, 1fr); gap: 1px; width: min(100%, 600px); border: 4px solid #6b472b; background: #6b472b; }
        .board-game-board.xiangqi, .board-game-board.go { grid-template-columns: repeat(9, 1fr); }
        .board-game-board.xiangqi { grid-template-rows: repeat(10, 1fr); aspect-ratio: 0.9; background: #edcc8f; }
        .board-game-board.go { background-color: #d6aa66; background-image: linear-gradient(#684927 1px, transparent 1px), linear-gradient(90deg, #684927 1px, transparent 1px); background-size: calc(100% / 9) calc(100% / 9); background-position: 5.555% 5.555%; border: 0; width: min(100%, 510px); padding: 0; }
        .board-game-cell { position: relative; display: flex; min-width: 0; min-height: 0; align-items: center; justify-content: center; padding: 0 !important; border-radius: 0 !important; background: #f0d9b5 !important; color: #111827; }
        .board-game-cell.dark-square { background: #b88959 !important; }
        .board-game-cell.caro-cell { background: #1e293b !important; color: #111827; font-size: clamp(9px, 2.2vw, 22px); font-weight: 900; }
        .board-game-cell.caro-winning-cell { background: #fbbf24 !important; animation: king-check-pulse .8s ease-in-out infinite alternate; }
        .caro-symbol.X { color: #ef4444; }
        .caro-symbol.O { color: #3b82f6; }
        .caro-rule-box { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: #e2e8f0; font-size: 12px; }
        .caro-rule-box button { padding: 6px 9px; font-size: 11px; }
        .caro-rule-box small { color: #7dd3fc; }
        .board-game-board.xiangqi .board-game-cell { background: transparent !important; border: 1px solid #8c6036; }
        .board-game-board.xiangqi .board-game-cell:nth-child(9n + 1) { border-left: 0; }
        .board-game-board.xiangqi .board-game-cell:nth-child(9n) { border-right: 0; }
        .board-game-board.go .board-game-cell { background: transparent !important; }
        .board-game-cell.selected { box-shadow: inset 0 0 0 4px #22c55e; z-index: 1; }
        .board-game-cell.king-in-check { z-index: 2; animation: king-check-pulse 0.8s ease-in-out infinite alternate; }
        .board-game-cell.king-in-check .game-piece { filter: drop-shadow(0 0 8px #ef4444) drop-shadow(0 0 14px #fbbf24); }
        .check-warning { color: #fca5a5 !important; animation: king-check-text 0.8s ease-in-out infinite alternate; }
        @keyframes king-check-pulse {
          from { box-shadow: inset 0 0 0 3px #ef4444, 0 0 8px #ef4444; background-color: #ef444466; }
          to { box-shadow: inset 0 0 0 5px #fbbf24, 0 0 18px #fbbf24; background-color: #fbbf2466; }
        }
        @keyframes king-check-text { to { text-shadow: 0 0 10px #ef4444; } }
        .board-game-cell.legal-move::after { content: ''; position: absolute; width: 23%; height: 23%; border-radius: 50%; background: #16a34a99; }
        .board-game-cell.go-point.legal-move::after { width: 76%; height: 76%; }
        .game-piece { z-index: 1; font-family: "Segoe UI Symbol", "Noto Sans CJK SC", serif; font-size: clamp(20px, 5vw, 46px); line-height: 1; }
        .game-piece.light-piece { color: #f8fafc; text-shadow: -1px -1px #111, 1px 1px #111, 0 2px 3px #111; }
        .game-piece.dark-piece { color: #111827; text-shadow: 0 1px #f8fafc; }
        .xiangqi .game-piece { font-size: clamp(15px, 3.2vw, 31px); border: 2px solid currentColor; border-radius: 50%; background: #f8ead2; padding: 2px; }
        .xiangqi .light-piece { color: #b91c1c; }
        .xiangqi .dark-piece { color: #1f2937; }
        .go-stone { z-index: 1; width: 78%; height: 78%; border-radius: 50%; box-shadow: 1px 2px 3px #0008; }
        .black-stone { background: radial-gradient(circle at 35% 30%, #555, #080808 70%); }
        .white-stone { background: radial-gradient(circle at 35% 30%, #fff, #d4d4d4 80%); border: 1px solid #666; }
        .move-dot { z-index: 1; width: 28%; height: 28%; background: #16a34a99; border-radius: 50%; }
        .pass-btn { margin-top: 10px; background: #7c3aed !important; }
        .board-game-chat { display: flex; flex-direction: column; width: min(100%, 300px); height: 430px; background: #202737; border-radius: 10px; padding: 10px; box-sizing: border-box; }
        .board-game-chat h3 { margin: 0 0 8px; font-size: 14px; color: #f7dfad; }
        .board-game-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 7px; }
        .board-game-message { padding: 7px; border-radius: 7px; background: #334155; font-size: 12px; text-align: left; }
        .board-game-message.mine { background: #075985; }
        .board-game-message small { float: right; color: #cbd5e1; }
        .board-game-message p { margin: 4px 0 0; overflow-wrap: anywhere; }
        .empty-chat { color: #94a3b8; font-size: 12px; }
        .board-game-chat form { display: flex; gap: 6px; margin-top: 8px; }
        .board-game-chat input { flex: 1; min-width: 0; border: 1px solid #475569; border-radius: 6px; padding: 7px; background: #0f172a; color: white; }
        .board-game-lobby { min-height: 260px; padding: 20px; border-radius: 10px; background: #202737; text-align: center; }
        .board-game-lobby h3 { color: #f7dfad; font-size: 14px; }
        .board-game-lobby-list { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; }
        .board-game-lobby-list span { padding: 6px 10px; border-radius: 20px; background: #334155; font-size: 12px; }
        @media (max-width: 640px) {
          .board-game-room { padding: 8px; }
          .board-game-header { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
          .board-game-header h2 { grid-column: 1 / -1; grid-row: 1; white-space: normal; }
          .board-game-header-spacer { display: none; }
          .board-game-header-right { grid-column: 1 / -1; grid-row: 2; width: 100%; flex-direction: row; align-items: center; justify-content: space-between; flex-wrap: wrap; }
          .board-game-board-wrap { width: 100%; }
          .board-game-board.chess { width: min(100%, 460px); }
          .board-game-board.caro { width: min(100%, 600px); }
          .board-game-board.xiangqi { width: min(100%, 420px); }
          .board-game-board.go { width: min(100%, 420px); }
          .board-game-chat { width: 100%; height: 300px; }
          .board-game-actions { justify-content: flex-start; }
          .board-game-lobby-layout .board-game-lobby, .board-game-common-chat { flex-basis: 100%; }
        }
      `}</style>
    </section>
  );
}
