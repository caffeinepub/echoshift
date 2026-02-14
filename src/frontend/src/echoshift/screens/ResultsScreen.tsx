import { useSession } from '../state/session';
import { useRoomState } from '../api/useRoomState';
import { usePlayAgain } from '../api/usePlayAgain';
import ScreenLayout from '../components/ScreenLayout';
import AppHeader from '../components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, CheckCircle2, XCircle, Trophy, Shield } from 'lucide-react';

export default function ResultsScreen() {
  const { roomCode } = useSession();
  const { data: roomState } = useRoomState(roomCode);
  const playAgainMutation = usePlayAgain();

  if (!roomState) {
    return (
      <ScreenLayout>
        <AppHeader title="Results" />
        <p className="text-center text-muted-foreground">Loading results...</p>
      </ScreenLayout>
    );
  }

  // Find the Anchor by role
  const anchor = roomState.players.find(p => p.role === 'Anchor');
  const nonAnchorPlayers = roomState.players.filter(p => p.role !== 'Anchor');
  
  // Get the Anchor's guesses (selected players)
  const selectedPlayerIds = new Set(roomState.guesses.map(g => g.targetId));

  // Calculate scoring
  const correctGuessCount = Array.from(selectedPlayerIds).filter(id => 
    nonAnchorPlayers.some(p => p.id === id)
  ).length;

  // Calculate points for each player
  const playerPoints = new Map<string, number>();
  
  // Anchor gets 1 point for each correct guess
  if (anchor) {
    playerPoints.set(anchor.id, correctGuessCount);
  }

  // Each non-Anchor player gets 1 point if they were NOT selected
  nonAnchorPlayers.forEach(player => {
    const wasSelected = selectedPlayerIds.has(player.id);
    playerPoints.set(player.id, wasSelected ? 0 : 1);
  });

  // Find survivors (non-Anchor players who were not caught)
  const survivors = nonAnchorPlayers.filter(p => !selectedPlayerIds.has(p.id));

  const handlePlayAgain = () => {
    playAgainMutation.mutate();
  };

  return (
    <ScreenLayout>
      <AppHeader title="Game Results" subtitle="Here's what happened!" />

      <div className="space-y-6">
        {/* Summary Message */}
        <Card className="bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Trophy className="h-12 w-12 mx-auto text-chart-1 mb-2" />
              <p className="text-2xl font-bold">
                Anchor guessed {correctGuessCount}/{nonAnchorPlayers.length} correctly!
              </p>
              {survivors.length > 0 && (
                <div className="mt-4 space-y-1">
                  {survivors.map(survivor => (
                    <p key={survivor.id} className="text-sm text-muted-foreground">
                      <Shield className="inline h-4 w-4 mr-1 text-green-600" />
                      {survivor.name} survived without being caught!
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Anchor Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-chart-1" />
              The Anchor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-chart-1/10 border border-chart-1/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{anchor?.name || 'Unknown'}</p>
                  <Badge variant="secondary" className="mt-1">Anchor</Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                  <p className="text-3xl font-bold text-chart-1">{playerPoints.get(anchor?.id || '') || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Players Section */}
        <Card>
          <CardHeader>
            <CardTitle>All Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nonAnchorPlayers.map((player) => {
                const wasSelected = selectedPlayerIds.has(player.id);
                const isCorrect = wasSelected; // Correct if selected (they were weird)
                const points = playerPoints.get(player.id) || 0;

                return (
                  <div
                    key={player.id}
                    className={`p-4 rounded-xl border transition-all ${
                      wasSelected 
                        ? 'bg-chart-2/10 border-chart-2/30 shadow-sm' 
                        : 'bg-muted/30 border-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-lg">{player.name}</p>
                          {wasSelected && (
                            isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            )
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="font-medium">
                            {player.role}
                          </Badge>
                          {wasSelected ? (
                            <Badge variant="default" className="bg-chart-2">
                              Selected by Anchor
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-600/10 text-green-700 border-green-600/20">
                              Not Selected
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground">Points</p>
                        <p className="text-2xl font-bold text-chart-1">+{points}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handlePlayAgain} 
          className="w-full" 
          size="lg"
          disabled={playAgainMutation.isPending}
        >
          {playAgainMutation.isPending ? 'Starting new round...' : 'Play Again'}
        </Button>
      </div>
    </ScreenLayout>
  );
}
