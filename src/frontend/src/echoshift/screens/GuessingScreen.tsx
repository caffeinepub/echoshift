import { useSession } from '../state/session';
import { useRoomState } from '../api/useRoomState';
import ScreenLayout from '../components/ScreenLayout';
import AppHeader from '../components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function GuessingScreen() {
  const { roomCode, username } = useSession();
  const { data: roomState } = useRoomState(roomCode);

  const currentPlayer = roomState?.players.find(p => p.name === username);
  const isAnchor = currentPlayer?.isAnchor || false;

  return (
    <ScreenLayout>
      <AppHeader title="Guessing Phase" subtitle="Time to make your guess!" />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Guessing</CardTitle>
          </CardHeader>
          <CardContent>
            {isAnchor ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>You are the Anchor</AlertTitle>
                <AlertDescription>
                  The guessing feature is not yet implemented in the backend.
                  This screen will allow you to select which player you think was acting weird.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Waiting for Anchor</AlertTitle>
                <AlertDescription>
                  The Anchor is deciding who they think was acting weird...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </ScreenLayout>
  );
}
