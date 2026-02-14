import { ReactNode } from 'react';

interface ScreenLayoutProps {
  children: ReactNode;
}

export default function ScreenLayout({ children }: ScreenLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </div>
      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs text-muted-foreground bg-background/80 backdrop-blur-sm border-t">
        <p>
          © {new Date().getFullYear()} · Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
