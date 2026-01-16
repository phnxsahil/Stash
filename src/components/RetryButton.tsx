import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface RetryButtonProps {
  onRetry: () => void;
  disabled?: boolean;
}

export function RetryButton({ onRetry, disabled }: RetryButtonProps) {
  return (
    <Button
      onClick={onRetry}
      disabled={disabled}
      variant="outline"
      className="group hover:border-[#1DB954] hover:text-[#1DB954] transition-colors"
    >
      <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
      Try Again
    </Button>
  );
}
