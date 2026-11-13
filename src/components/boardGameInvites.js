import { get, ref, set, update } from 'firebase/database';
import { db } from '../firebase';

export async function sendGameInvite(targetUsername, invite) {
  await set(ref(db, `board_game_invites/${targetUsername}`), {
    ...invite,
    timestamp: Date.now()
  });
}

export async function revokePendingGameInvites(game, roomId, roomData) {
  const invitedUsers = roomData?.invitedUsers || {};
  const inviteStatuses = roomData?.inviteStatus || {};
  const updates = {};

  await Promise.all(Object.keys(invitedUsers).map(async (username) => {
    const status = inviteStatuses[username];
    if (status === 'declined' || status === 'accepted') return;
    if (!status || status === 'pending') {
      updates[`board_games/${game}/rooms/${roomId}/inviteStatus/${username}`] = 'revoked';
    }
    const inviteRef = ref(db, `board_game_invites/${username}`);
    const inviteSnapshot = await get(inviteRef);
    if (inviteSnapshot.val()?.game === game && inviteSnapshot.val()?.roomId === roomId) {
      updates[`board_game_invites/${username}`] = null;
    }
  }));

  if (Object.keys(updates).length) await update(ref(db), updates);
}
