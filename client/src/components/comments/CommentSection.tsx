import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../context/AuthContext';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { Skeleton } from '../ui/Skeleton';
import { Link, useLocation } from 'react-router-dom';

export function CommentSection({ featureId }: { featureId: string }) {
  const { data: commentsRes, isLoading } = useComments(featureId);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const comments = commentsRes?.data;
  const rootComments = comments || [];

  const totalComments = rootComments.reduce((acc: number, curr: any) => acc + 1 + (curr.replies?.length || 0), 0);

  return (
    <div className="mt-8" id="comments">
      <h3 className="text-xl font-bold mb-6">{totalComments} Comments</h3>
      
      <div className="mb-8">
        {isAuthenticated ? (
          <CommentForm featureId={featureId} />
        ) : (
          <div className="bg-gray-50 border rounded-lg p-4 text-center">
            <p className="text-gray-600 mb-2">Login to join the discussion</p>
            <Link
              to="/login"
              state={{ from: location }}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700"
            >
              Log in to comment
            </Link>
          </div>
        )}
      </div>

      <div className="divide-y">
        {rootComments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Be the first to share your thoughts.</p>
        ) : (
          rootComments.map((comment: any) => (
            <CommentItem key={comment._id} comment={comment} featureId={featureId} />
          ))
        )}
      </div>
    </div>
  );
}
