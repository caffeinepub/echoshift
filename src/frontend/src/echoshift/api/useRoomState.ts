import { useQuery } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import type { RoomState } from '@/backend';

export function useRoomState(roomCode: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RoomState | null>({
    queryKey: ['roomState', roomCode],
    queryFn: async () => {
      if (!actor || !roomCode) return null;
      try {
        return await actor.getRoomState(roomCode);
      } catch (error) {
        console.error('Failed to fetch room state:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!roomCode,
    refetchInterval: 2000, // Poll every 2 seconds
    staleTime: 1000,
  });
}
