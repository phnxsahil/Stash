import { Song } from './api';

export function calculateStreak(history: Song[]): number {
  if (history.length === 0) return 0;

  // Convert history dates to YYYY-MM-DD strings to ignore time
  const dates = new Set(
    history.map(song => new Date(song.created_at || '').toISOString().split('T')[0])
  );

  const sortedDates = Array.from(dates).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streak = 0;
  let currentCheck = today;

  // Check if today is present, if not, check yesterday (streak continues if user missed just today so far)
  if (!dates.has(today)) {
    if (dates.has(yesterday)) {
      currentCheck = yesterday;
    } else {
      return 0; // Streak broken
    }
  }

  for (const date of sortedDates) {
    if (date === currentCheck) {
      streak++;
      // Move to previous day
      const prevDate = new Date(currentCheck);
      prevDate.setDate(prevDate.getDate() - 1);
      currentCheck = prevDate.toISOString().split('T')[0];
    } else if (date < currentCheck) {
      break; // Gap found, streak ends
    }
  }

  return streak;
}
