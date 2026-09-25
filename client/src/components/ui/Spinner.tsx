import { Spinner as CossSpinner } from './coss/spinner';
import { cn } from '../../lib/utils';

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center">
      <CossSpinner className={cn('text-primary', sizeClasses[size], className)} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
