import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Screen = 'home' | 'lobby' | 'topicSelection' | 'chat' | 'guessing' | 'results';

interface SessionState {
  playerId: string | null;
  username: string | null;
  roomCode: string | null;
  isHost: boolean;
  screen: Screen;
  lastError: string | null;
  
  setPlayerId: (id: string) => void;
  setUsername: (name: string) => void;
  setRoomCode: (code: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  setScreen: (screen: Screen) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      playerId: null,
      username: null,
      roomCode: null,
      isHost: false,
      screen: 'home',
      lastError: null,

      setPlayerId: (id) => set({ playerId: id }),
      setUsername: (name) => set({ username: name }),
      setRoomCode: (code) => set({ roomCode: code }),
      setIsHost: (isHost) => set({ isHost }),
      setScreen: (screen) => set({ screen }),
      setError: (error) => set({ lastError: error }),
      reset: () => set({
        roomCode: null,
        isHost: false,
        screen: 'home',
        lastError: null,
      }),
    }),
    {
      name: 'echoshift-session',
      partialize: (state) => ({
        playerId: state.playerId,
        username: state.username,
      }),
    }
  )
);
