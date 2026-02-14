import { useSession } from '../state/session';
import { Badge } from '@/components/ui/badge';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { username, roomCode } = useSession();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </h1>
        {username && (
          <Badge variant="secondary" className="text-sm">
            {username}
          </Badge>
        )}
      </div>
      {subtitle && (
        <p className="text-muted-foreground">{subtitle}</p>
      )}
      {roomCode && (
        <div className="mt-3">
          <Badge variant="outline" className="text-base font-mono px-4 py-1">
            Room: {roomCode}
          </Badge>
        </div>
      )}
    </div>
  );
}
