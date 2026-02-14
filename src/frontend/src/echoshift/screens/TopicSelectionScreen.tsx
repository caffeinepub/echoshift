import { useEffect, useState } from 'react';
import { useSession } from '../state/session';
import { useRoomState } from '../api/useRoomState';
import { useVoteForTopic } from '../api/useVoteForTopic';
import ScreenLayout from '../components/ScreenLayout';
import AppHeader from '../components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Vote, CheckCircle2 } from 'lucide-react';

export default function TopicSelectionScreen() {
  const { roomCode, playerId } = useSession();
  const { data: roomState } = useRoomState(roomCode);
  const voteForTopic = useVoteForTopic();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Calculate time remaining
  useEffect(() => {
    if (!roomState?.topicSelectionStartTime) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const startTime = Number(roomState.topicSelectionStartTime) / 1_000_000; // Convert nanoseconds to milliseconds
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 20000 - elapsed); // 20 seconds in milliseconds
      setTimeRemaining(Math.ceil(remaining / 1000)); // Convert to seconds
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [roomState?.topicSelectionStartTime]);

  if (!roomState) {
    return (
      <ScreenLayout>
        <AppHeader title="Topic Selection" subtitle="Loading..." />
      </ScreenLayout>
    );
  }

  const topics = roomState.generatedTopics || [];
  const myVote = roomState.votes.find(v => v.playerId === playerId);
  const votedTopicIndex = myVote ? Number(myVote.topicIndex) : null;
  const totalPlayers = roomState.players.length;
  const totalVotes = roomState.votes.length;
  const allVoted = totalVotes >= totalPlayers;

  const handleVote = (index: number) => {
    voteForTopic.mutate(index);
  };

  return (
    <ScreenLayout>
      <AppHeader title="Topic Selection" subtitle="Vote for a conversation topic" />

      <div className="space-y-6">
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {allVoted ? (
                <span className="font-semibold text-green-600 dark:text-green-400">
                  All players voted! Moving to chat...
                </span>
              ) : (
                <span>
                  <span className="font-semibold">{totalVotes}/{totalPlayers}</span> players voted
                </span>
              )}
            </span>
            {timeRemaining !== null && !allVoted && (
              <Badge variant="secondary" className="ml-2">
                {timeRemaining}s
              </Badge>
            )}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Choose a Topic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topics.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Generating topics...
              </p>
            ) : (
              topics.map((topic, index) => {
                const isSelected = votedTopicIndex === index;
                const voteCount = roomState.votes.filter(v => Number(v.topicIndex) === index).length;

                return (
                  <Button
                    key={index}
                    onClick={() => handleVote(index)}
                    disabled={voteForTopic.isPending || allVoted}
                    variant={isSelected ? 'default' : 'outline'}
                    className="w-full h-auto py-4 px-6 text-left justify-start relative"
                  >
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary-foreground" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-base leading-relaxed">
                            {topic.question}
                          </p>
                          {voteCount > 0 && (
                            <Badge 
                              variant={isSelected ? 'secondary' : 'outline'} 
                              className="mt-2"
                            >
                              {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })
            )}
          </CardContent>
        </Card>

        {votedTopicIndex !== null && !allVoted && (
          <Alert>
            <AlertDescription className="text-center">
              Your vote has been recorded. Waiting for other players...
            </AlertDescription>
          </Alert>
        )}
      </div>
    </ScreenLayout>
  );
}
