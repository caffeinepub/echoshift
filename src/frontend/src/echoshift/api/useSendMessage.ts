import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { useSession } from '../state/session';
import { toast } from 'sonner';

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { roomCode, username } = useSession();

  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor || !roomCode || !username) {
        throw new Error('Missing required data');
      }

      await actor.sendMessage(roomCode, username, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomState', roomCode] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}
