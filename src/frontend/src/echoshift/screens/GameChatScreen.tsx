import { useEffect } from 'react';
import { useSession } from '../state/session';
import { useRoomState } from '../api/useRoomState';
import { useSendMessage } from '../api/useSendMessage';
import { useCheckAndAdvancePhase } from '../api/useCheckAndAdvancePhase';
import { useChatCountdown } from '../hooks/useChatCountdown';
import ScreenLayout from '../components/ScreenLayout';
import AppHeader from '../components/AppHeader';
import ChatMessageList from '../components/ChatMessageList';
import ChatComposer from '../components/ChatComposer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, MessageSquare, Clock } from 'lucide-react';
import { Phase } from '@/backend';

export default function GameChatScreen() {
  const { roomCode, username } = useSession();
  const { data: roomState } = useRoomState(roomCode);
  const sendMessage = useSendMessage();
  const checkAndAdvancePhase = useCheckAndAdvancePhase();
  const { remainingSeconds, formattedTime, isExpired } = useChatCountdown(roomState);

  const currentPlayer = roomState?.players.find(p => p.name === username);
  const isAnchor = currentPlayer?.role === 'Anchor';
  const playerRole = currentPlayer?.role;
  const selectedTopic = roomState?.selectedTopic;

  // Trigger phase advance check when timer expires
  useEffect(() => {
    if (!roomState || roomState.phase !== Phase.chatting) {
      return;
    }

    if (isExpired) {
      // Trigger immediately when expired
      checkAndAdvancePhase.mutate();

      // Continue checking periodically while still in chatting phase
      const interval = setInterval(() => {
        if (roomState.phase === Phase.chatting) {
          checkAndAdvancePhase.mutate();
        }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isExpired, roomState?.phase]);

  const handleSendMessage = (message: string) => {
    sendMessage.mutate(message);
  };

  const isChatDisabled = isExpired || roomState?.phase !== Phase.chatting;

  return (
    <ScreenLayout>
      <AppHeader title="Game Chat" subtitle="Chat with other players" />

      <div className="space-y-4">
        {/* Countdown Timer */}
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="font-semibold">
              {isExpired ? 'Time is up! Moving to guessing...' : 'Time Remaining'}
            </span>
            <Badge 
              variant={isExpired ? 'destructive' : remainingSeconds && remainingSeconds <= 30 ? 'destructive' : 'secondary'}
              className="ml-2 text-base font-mono"
            >
              {formattedTime}
            </Badge>
          </AlertDescription>
        </Alert>

        {selectedTopic && (
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">Topic: </span>
              {selectedTopic.question}
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {isAnchor ? (
              <span className="font-semibold">
                You are the Anchor. Observe carefully.
              </span>
            ) : (
              <span className="font-semibold">
                Your Personality: {playerRole || 'Unknown'}
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
              disabled={isChatDisabled}
            />
          </CardContent>
        </Card>

        {isExpired && (
          <Alert>
            <AlertDescription className="text-center">
              Chat time has ended. Transitioning to guessing phase...
            </AlertDescription>
          </Alert>
        )}
      </div>
    </ScreenLayout>
  );
}
