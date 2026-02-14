import { useEffect, useState } from 'react';
import type { RoomStateView } from '@/backend';

const CHAT_DURATION_MS = 180_000; // 180 seconds in milliseconds

export function useChatCountdown(roomState: RoomStateView | null | undefined) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!roomState?.chatCountdownStartTime) {
      setRemainingSeconds(null);
      return;
    }

    const updateTimer = () => {
      const startTime = Number(roomState.chatCountdownStartTime) / 1_000_000; // Convert nanoseconds to milliseconds
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, CHAT_DURATION_MS - elapsed);
      setRemainingSeconds(Math.ceil(remaining / 1000)); // Convert to seconds
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [roomState?.chatCountdownStartTime]);

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    remainingSeconds,
    formattedTime: formatTime(remainingSeconds),
    isExpired: remainingSeconds !== null && remainingSeconds <= 0,
  };
}
