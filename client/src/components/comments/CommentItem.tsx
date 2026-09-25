import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { Comment } from '../../types';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useDeleteComment, useUpdateComment } from '../../hooks/useComments';
import { CommentForm } from './CommentForm';
import toast from 'react-hot-toast';

export function CommentItem({ comment, featureId }: { comment: Comment; featureId: string }) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const deleteMutation = useDeleteComment(featureId);
  const updateMutation = useUpdateComment(featureId);

  const isAuthor = user?._id === comment.author._id;
  const isAdmin = user?.role === 'ADMIN';

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(comment._id, {
        onSuccess: () => toast.success('Comment deleted'),
        onError: (err: any) => toast.error(err.message || 'Failed to delete')
      });
    }
  };

  const handleUpdate = () => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    updateMutation.mutate(
      { commentId: comment._id, content: editContent.trim() },
      {
        onSuccess: () => {
          toast.success('Comment updated');
          setIsEditing(false);
        },
        onError: (err: any) => toast.error(err.message || 'Failed to update comment')
      }
    );
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="py-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
            {getInitials(comment.author.name)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{comment.author.name}</span>
            <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
          </div>
          
          {isEditing ? (
            <div className="my-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-gray-700 mb-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {DOMPurify.sanitize(comment.content)}
              </ReactMarkdown>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm mt-2">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-gray-500 hover:text-gray-900 font-medium"
            >
              Reply
            </button>
            {isAuthor && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Edit
              </button>
            )}
            {(isAuthor || isAdmin) && (
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 font-medium"
                disabled={deleteMutation.isPending}
              >
                Delete
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-4 border-l-2 border-gray-200 pl-4">
              <CommentForm
                featureId={featureId}
                parentCommentId={comment._id}
                onSuccess={() => setIsReplying(false)}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 border-l-2 border-gray-100 pl-4 space-y-4">
              {comment.replies.map(reply => (
                <CommentItem key={reply._id} comment={reply} featureId={featureId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
