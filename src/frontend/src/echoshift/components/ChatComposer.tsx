import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function ChatComposer({ onSend, disabled, isLoading }: ChatComposerProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed && trimmed.length <= 500) {
      onSend(trimmed);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        disabled={disabled || isLoading}
        maxLength={500}
        className="flex-1"
      />
      <Button
        type="submit"
        disabled={disabled || isLoading || !message.trim()}
        size="icon"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
