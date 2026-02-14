import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { useSession } from '../state/session';

export function useCheckAndAdvancePhase() {
  const { actor } = useActor();
  const { roomCode } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor || !roomCode) {
        throw new Error('Actor or room code not available');
      }
      await actor.checkAndAdvancePhase(roomCode);
    },
    onSuccess: () => {
      // Invalidate room state to trigger re-fetch and phase transition
      queryClient.invalidateQueries({ queryKey: ['roomState', roomCode] });
    },
    onError: (error) => {
      console.error('Failed to check and advance phase:', error);
    },
  });
}
