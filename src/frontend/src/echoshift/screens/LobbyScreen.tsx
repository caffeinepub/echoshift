import { useSession } from '../state/session';
import { useRoomState } from '../api/useRoomState';
import { useStartGame } from '../api/useStartGame';
import ScreenLayout from '../components/ScreenLayout';
import AppHeader from '../components/AppHeader';
import ErrorBanner from '../components/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Crown } from 'lucide-react';

export default function LobbyScreen() {
  const { roomCode, playerId, isHost, reset } = useSession();
  const { data: roomState, isLoading } = useRoomState(roomCode);
  const startGame = useStartGame();

  if (isLoading) {
    return (
      <ScreenLayout>
        <AppHeader title="Lobby" subtitle="Loading room..." />
      </ScreenLayout>
    );
  }

  if (!roomState) {
    return (
      <ScreenLayout>
        <AppHeader title="Lobby" />
        <ErrorBanner message="Room not found. Please return home and try again." />
        <Button onClick={reset} variant="outline" className="mt-4">
          Return Home
        </Button>
      </ScreenLayout>
    );
  }

  const playerCount = roomState.players.length;
  const canStart = isHost && playerCount >= 3 && playerCount <= 6;

  return (
    <ScreenLayout>
      <AppHeader title="Lobby" subtitle="Waiting for players to join..." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players ({playerCount}/6)
              </CardTitle>
              {playerCount < 3 && (
                <Badge variant="outline">Need {3 - playerCount} more</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roomState.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <span className="font-medium">{player.name}</span>
                  <div className="flex items-center gap-2">
                    {player.id === roomState.hostId && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Host
                      </Badge>
                    )}
                    {player.id === playerId && (
                      <Badge variant="outline">You</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {isHost && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle>Host Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {playerCount < 3 && (
                  <ErrorBanner
                    title="Not enough players"
                    message="You need at least 3 players to start the game."
                  />
                )}
                {playerCount > 6 && (
                  <ErrorBanner
                    title="Too many players"
                    message="Maximum 6 players allowed."
                  />
                )}
                <Button
                  onClick={() => startGame.mutate()}
                  disabled={!canStart || startGame.isPending}
                  className="w-full"
                  size="lg"
                >
                  {startGame.isPending ? 'Starting...' : 'Start Game'}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {!isHost && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Waiting for the host to start the game...
              </p>
            </CardContent>
          </Card>
        )}

        <Button onClick={reset} variant="outline" className="w-full">
          Leave Room
        </Button>
      </div>
    </ScreenLayout>
  );
}
