import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { useSession } from '../state/session';
import { toast } from 'sonner';

export function usePlayAgain() {
  const { actor } = useActor();
  const { roomCode } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor || !roomCode) {
        throw new Error('Missing required data');
      }

      await actor.playAgain(roomCode);
    },
    onSuccess: () => {
      // Invalidate room state to trigger phase transition back to lobby
      queryClient.invalidateQueries({ queryKey: ['roomState', roomCode] });
      toast.success('Starting a new round!');
    },
    onError: (error: Error) => {
      toast.error('Failed to restart game', {
        description: error.message || 'Please try again.',
      });
    },
  });
}
