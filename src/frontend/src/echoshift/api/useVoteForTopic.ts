import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { useSession } from '../state/session';
import { toast } from 'sonner';

export function useVoteForTopic() {
  const { actor } = useActor();
  const { roomCode, playerId } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicIndex: number) => {
      if (!actor || !roomCode || !playerId) {
        throw new Error('Missing required data');
      }
      await actor.voteForTopic(roomCode, playerId, BigInt(topicIndex));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomState', roomCode] });
    },
    onError: (error: Error) => {
      toast.error('Failed to vote', {
        description: error.message || 'Please try again.',
      });
    },
  });
}
