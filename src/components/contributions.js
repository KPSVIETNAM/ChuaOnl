import { ref, runTransaction } from 'firebase/database';
import { db } from '../firebase';

export function addContribution(username, amount) {
  if (!username) return Promise.resolve();

  return runTransaction(ref(db, `users/${username}/chiSoDongGop`), (score) => {
    const currentScore = Number(score) || 0;
    return Math.round((currentScore + amount) * 100) / 100;
  });
}
