import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { useSession } from '../state/session';
import { toast } from 'sonner';
import type { Guess } from '@/backend';

export function useSubmitGuess() {
  const { actor } = useActor();
  const { roomCode, playerId } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (selectedPlayerIds: string[]) => {
      if (!actor || !roomCode || !playerId) {
        throw new Error('Missing required data');
      }

      // Create guess objects for each selected player
      const guesses: Guess[] = selectedPlayerIds.map(targetId => ({
        guesserId: playerId,
        targetId,
        guess: 'Weird', // Mark as "Weird" - the Anchor thinks this player has a personality card
      }));

      return await actor.submitGuesses(roomCode, guesses);
    },
    onSuccess: () => {
      // Invalidate room state to trigger phase transition to results
      queryClient.invalidateQueries({ queryKey: ['roomState', roomCode] });
    },
    onError: (error: Error) => {
      toast.error('Failed to submit guess', {
        description: error.message || 'Please try again.',
      });
    },
  });
}
