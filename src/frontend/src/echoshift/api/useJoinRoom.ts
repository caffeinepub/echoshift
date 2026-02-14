import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { useSession } from '../state/session';
import { toast } from 'sonner';

export function useJoinRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { playerId, username, setRoomCode, setIsHost, setScreen } = useSession();

  return useMutation({
    mutationFn: async (roomCode: string) => {
      if (!actor || !playerId || !username) {
        throw new Error('Missing required data');
      }

      await actor.joinRoom(roomCode, playerId, username);
      return roomCode;
    },
    onSuccess: (roomCode) => {
      setRoomCode(roomCode);
      setIsHost(false);
      setScreen('lobby');
      queryClient.invalidateQueries({ queryKey: ['roomState', roomCode] });
      toast.success('Joined room successfully!');
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to join room';
      if (message.includes('not found')) {
        toast.error('Room not found. Please check the code.');
      } else if (message.includes('full')) {
        toast.error('Room is full (max 6 players)');
      } else {
        toast.error(message);
      }
    },
  });
}
