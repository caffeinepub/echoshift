import { useSession } from '../state/session';
import { useRoomState } from '../api/useRoomState';
import { useSendMessage } from '../api/useSendMessage';
import ScreenLayout from '../components/ScreenLayout';
import AppHeader from '../components/AppHeader';
import ChatMessageList from '../components/ChatMessageList';
import ChatComposer from '../components/ChatComposer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function GameChatScreen() {
  const { roomCode, username } = useSession();
  const { data: roomState } = useRoomState(roomCode);
  const sendMessage = useSendMessage();

  const currentPlayer = roomState?.players.find(p => p.name === username);
  const isAnchor = currentPlayer?.role === 'Anchor';
  const playerRole = currentPlayer?.role;

  const handleSendMessage = (message: string) => {
    sendMessage.mutate(message);
  };

  return (
    <ScreenLayout>
      <AppHeader title="Game Chat" subtitle="Chat with other players" />

      <div className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {isAnchor ? (
              <span className="font-semibold">
                You are the Anchor! Everyone else is acting weird. Try to figure out who they are.
              </span>
            ) : (
              <span>
                Your role: <span className="font-semibold">{playerRole || 'Unknown'}</span>
                <br />
                Act according to your role. The Anchor will try to guess who you are!
              </span>
            )}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChatMessageList
              messages={roomState?.chatMessages || []}
              currentUsername={username || ''}
            />
            <ChatComposer
              onSend={handleSendMessage}
              isLoading={sendMessage.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </ScreenLayout>
  );
}
