import { useState } from 'react';
import { useSession } from '../state/session';
import { useRoomState } from '../api/useRoomState';
import { useSubmitGuess } from '../api/useSubmitGuess';
import ScreenLayout from '../components/ScreenLayout';
import AppHeader from '../components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, Users } from 'lucide-react';

export default function GuessingScreen() {
  const { roomCode, playerId } = useSession();
  const { data: roomState } = useRoomState(roomCode);
  const submitGuess = useSubmitGuess();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  if (!roomState || !playerId) {
    return (
      <ScreenLayout>
        <AppHeader title="Guessing Phase" subtitle="Time to make your guess!" />
        <p className="text-center text-muted-foreground">Loading...</p>
      </ScreenLayout>
    );
  }

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const isAnchor = currentPlayer?.role === 'Anchor';
  
  // Get all non-Anchor players
  const nonAnchorPlayers = roomState.players.filter(p => p.role !== 'Anchor');

  const handleTogglePlayer = (playerId: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSubmit = () => {
    submitGuess.mutate(selectedPlayerIds);
  };

  return (
    <ScreenLayout>
      <AppHeader title="Guessing Phase" subtitle="Who was acting weird?" />

      <div className="space-y-4">
        {isAnchor ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select the Weird Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Select all players you think were acting according to a personality card.
                  You can select as many as you want.
                </p>
                
                <div className="space-y-3">
                  {nonAnchorPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={player.id}
                        checked={selectedPlayerIds.includes(player.id)}
                        onCheckedChange={() => handleTogglePlayer(player.id)}
                        disabled={submitGuess.isPending}
                      />
                      <Label
                        htmlFor={player.id}
                        className="flex-1 cursor-pointer font-medium"
                      >
                        {player.name}
                      </Label>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitGuess.isPending}
                  className="w-full mt-6"
                  size="lg"
                >
                  {submitGuess.isPending ? 'Submitting...' : 'Submit Guess'}
                </Button>
              </CardContent>
            </Card>

            {selectedPlayerIds.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Selected Players</AlertTitle>
                <AlertDescription>
                  You have selected {selectedPlayerIds.length} player{selectedPlayerIds.length !== 1 ? 's' : ''}.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Waiting for Anchor</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Please Wait</AlertTitle>
                <AlertDescription>
                  The Anchor is deciding who they think was acting weird. 
                  Results will be revealed shortly...
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </ScreenLayout>
  );
}
