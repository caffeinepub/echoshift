import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { useSession } from '../state/session';
import { toast } from 'sonner';

export function useStartGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { roomCode, playerId } = useSession();

  return useMutation({
    mutationFn: async () => {
      if (!actor || !roomCode || !playerId) {
        throw new Error('Missing required data');
      }

      await actor.startGame(roomCode, playerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomState', roomCode] });
      toast.success('Game started!');
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to start game';
      if (message.includes('at least 3')) {
        toast.error('Need at least 3 players to start');
      } else if (message.includes('Only the host')) {
        toast.error('Only the host can start the game');
      } else {
        toast.error(message);
      }
    },
  });
}
