import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { useSession } from '../state/session';
import { toast } from 'sonner';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { playerId, username, setRoomCode, setIsHost, setScreen } = useSession();

  return useMutation({
    mutationFn: async () => {
      if (!actor || !playerId || !username) {
        throw new Error('Missing required data');
      }

      const roomCode = generateRoomCode();
      await actor.createRoom(playerId, username, roomCode);
      return roomCode;
    },
    onSuccess: (roomCode) => {
      setRoomCode(roomCode);
      setIsHost(true);
      setScreen('lobby');
      queryClient.invalidateQueries({ queryKey: ['roomState', roomCode] });
      toast.success('Room created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create room');
    },
  });
}
