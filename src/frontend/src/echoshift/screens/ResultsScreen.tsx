import { useSession } from '../state/session';
import { useRoomState } from '../api/useRoomState';
import ScreenLayout from '../components/ScreenLayout';
import AppHeader from '../components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, User } from 'lucide-react';

export default function ResultsScreen() {
  const { roomCode, reset } = useSession();
  const { data: roomState } = useRoomState(roomCode);

  if (!roomState) {
    return (
      <ScreenLayout>
        <AppHeader title="Results" />
        <p className="text-center text-muted-foreground">Loading results...</p>
      </ScreenLayout>
    );
  }

  const anchor = roomState.players.find(p => p.isAnchor);
  const weirdPlayers = roomState.players.filter(p => !p.isAnchor);

  return (
    <ScreenLayout>
      <AppHeader title="Game Results" subtitle="Here's what happened!" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-chart-1" />
              The Anchor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-chart-1/10 border border-chart-1/20">
              <p className="text-lg font-semibold">{anchor?.name || 'Unknown'}</p>
              <p className="text-sm text-muted-foreground">Stayed normal throughout the game</p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-chart-2" />
              The Weird Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weirdPlayers.map((player) => (
                <div
                  key={player.id}
                  className="p-4 rounded-lg bg-muted/50 border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{player.name}</p>
                    <Badge variant="secondary">
                      {player.personalityCard?.trait || 'Unknown'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Was acting according to their personality card
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              The guessing and scoring features are not yet implemented.
            </p>
          </CardContent>
        </Card>

        <Button onClick={reset} className="w-full" size="lg">
          Return Home
        </Button>
      </div>
    </ScreenLayout>
  );
}
