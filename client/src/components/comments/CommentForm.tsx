import { useState } from 'react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useCreateComment } from '../../hooks/useComments';
import toast from 'react-hot-toast';

interface CommentFormProps {
  featureId: string;
  parentCommentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CommentForm({ featureId, parentCommentId, onSuccess, onCancel }: CommentFormProps) {
  const [content, setContent] = useState('');
  const createMutation = useCreateComment(featureId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createMutation.mutate(
      { content, parentComment: parentCommentId },
      {
        onSuccess: () => {
          setContent('');
          toast.success('Comment posted');
          onSuccess?.();
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to post comment');
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim()}
          isLoading={createMutation.isPending}
        >
          Post Comment
        </Button>
      </div>
    </form>
  );
}
