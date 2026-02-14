import { useEffect } from 'react';
import { useSession } from './echoshift/state/session';
import { useRoomState } from './echoshift/api/useRoomState';
import HomeScreen from './echoshift/screens/HomeScreen';
import LobbyScreen from './echoshift/screens/LobbyScreen';
import TopicSelectionScreen from './echoshift/screens/TopicSelectionScreen';
import GameChatScreen from './echoshift/screens/GameChatScreen';
import GuessingScreen from './echoshift/screens/GuessingScreen';
import ResultsScreen from './echoshift/screens/ResultsScreen';
import { Toaster } from '@/components/ui/sonner';
import { Phase } from './backend';

export default function App() {
  const { roomCode, playerId, screen, setScreen } = useSession();
  const { data: roomState } = useRoomState(roomCode);

  // Auto-transition screens based on room phase
  useEffect(() => {
    if (!roomState || !roomCode) return;

    const phase = roomState.phase;
    
    if (phase === Phase.waiting && screen !== 'lobby') {
      setScreen('lobby');
    } else if (phase === Phase.topicSelection && screen !== 'topicSelection') {
      setScreen('topicSelection');
    } else if (phase === Phase.chatting && screen !== 'chat') {
      setScreen('chat');
    } else if (phase === Phase.guessing && screen !== 'guessing') {
      setScreen('guessing');
    } else if (phase === Phase.results && screen !== 'results') {
      setScreen('results');
    }
  }, [roomState, roomCode, screen, setScreen]);

  const renderScreen = () => {
    if (!roomCode || !playerId) {
      return <HomeScreen />;
    }

    switch (screen) {
      case 'lobby':
        return <LobbyScreen />;
      case 'topicSelection':
        return <TopicSelectionScreen />;
      case 'chat':
        return <GameChatScreen />;
      case 'guessing':
        return <GuessingScreen />;
      case 'results':
        return <ResultsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <>
      {renderScreen()}
      <Toaster />
    </>
  );
}
