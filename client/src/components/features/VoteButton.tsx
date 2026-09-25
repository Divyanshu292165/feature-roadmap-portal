import { ArrowUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface VoteButtonProps {
  voteCount: number;
  hasVoted?: boolean;
  onLoginRequired: () => void;
  onVote: () => void;
  className?: string;
  large?: boolean;
}

export function VoteButton({ voteCount, hasVoted, onLoginRequired, onVote, className, large }: VoteButtonProps) {
  const { isAuthenticated } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }
    onVote();
  };

  return (
    <button
      onClick={handleClick}
      aria-label={hasVoted ? 'Remove vote' : 'Upvote feature'}
      className={cn(
        'flex flex-col items-center justify-center rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        {
          'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100': hasVoted,
          'bg-white border-gray-200 text-gray-700 hover:bg-gray-50': !hasVoted,
          'p-2 min-w-[3rem]': !large,
          'p-3 min-w-[4rem] text-lg': large,
        },
        className
      )}
    >
      <ArrowUp className={cn('mb-1', { 'h-4 w-4': !large, 'h-5 w-5': large, 'text-blue-600': hasVoted })} />
      <span className="font-semibold">{voteCount}</span>
    </button>
  );
}
