import { ref, update } from 'firebase/database';
import { db } from '../firebase';

export const GAME_STATUSES = {
  waiting: 'dang_doi',
  searching: 'dang_tim_ghep',
  playing: 'dang_dau'
};

export async function updateGamePresence(username, game, status) {
  if (!username) return;
  await update(ref(db, `online_users/${username}`), {
    activeGame: game,
    gameStatus: status
  });
}

export function getGamePresenceLabel(user) {
  if (user?.currentScreen === 'TinhTamDien') return 'Đang tịnh tâm';
  if (user?.gameStatus === GAME_STATUSES.searching) return 'Đang tìm trận';
  if (user?.gameStatus === GAME_STATUSES.playing) return `Đang đấu ${getGameLabel(user.activeGame)}`;
  if (user?.gameStatus === GAME_STATUSES.waiting && user?.activeGame) {
    return `Đang chờ ${getGameLabel(user.activeGame)}`;
  }
  return user?.currentScreen && user.currentScreen !== 'tamquan' ? `Đang ở: ${user.currentScreen}` : 'Đang online';
}

function getGameLabel(game) {
  return { caro: 'Caro', chess: 'cờ vua', xiangqi: 'cờ tướng', go: 'cờ vây' }[game] || 'Kỳ Viện';
}
