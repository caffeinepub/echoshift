import { useState } from 'react';
import { useLocalUsername } from '../identity/useLocalUsername';
import { getOrCreatePlayerId } from '../identity/playerId';
import { useSession } from '../state/session';
import { useCreateRoom } from '../api/useCreateRoom';
import { useJoinRoom } from '../api/useJoinRoom';
import ScreenLayout from '../components/ScreenLayout';
import AppHeader from '../components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RefreshCw } from 'lucide-react';

export default function HomeScreen() {
  const { username, resetUsername } = useLocalUsername();
  const { setPlayerId } = useSession();
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();
  const [joinCode, setJoinCode] = useState('');

  const ensurePlayerId = () => {
    const id = getOrCreatePlayerId();
    setPlayerId(id);
  };

  const handleCreateRoom = () => {
    ensurePlayerId();
    createRoom.mutate();
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length >= 4) {
      ensurePlayerId();
      joinRoom.mutate(code);
    }
  };

  return (
    <ScreenLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
              EchoShift
            </h1>
            <p className="text-muted-foreground">
              A party chat game where one player stays normal, and everyone else acts weird
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Username</CardTitle>
              <CardDescription>This is how other players will see you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-2 bg-muted rounded-md font-semibold">
                  {username}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetUsername}
                  title="Generate new username"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Room</CardTitle>
              <CardDescription>Start a new game and invite friends</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateRoom}
                disabled={createRoom.isPending}
                className="w-full"
                size="lg"
              >
                {createRoom.isPending ? 'Creating...' : 'Create New Room'}
              </Button>
            </CardContent>
          </Card>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              OR
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Join Room</CardTitle>
              <CardDescription>Enter a room code to join an existing game</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <Label htmlFor="roomCode">Room Code</Label>
                  <Input
                    id="roomCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="font-mono text-lg"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={joinRoom.isPending || joinCode.length < 4}
                  className="w-full"
                  size="lg"
                >
                  {joinRoom.isPending ? 'Joining...' : 'Join Room'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScreenLayout>
  );
}
