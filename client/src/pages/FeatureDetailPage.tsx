import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { useFeature } from '../hooks/useFeatures';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { VoteButton } from '../components/features/VoteButton';
import { useVote } from '../hooks/useVote';
import { formatDate } from '../lib/utils';
import { CommentSection } from '../components/comments/CommentSection';
import { useState } from 'react';
import { LoginModal } from '../components/auth/LoginModal';

export default function FeatureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: featureRes, isLoading, error } = useFeature(id!);
  const feature = featureRes?.data;
  const voteMutation = useVote();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-6">
          <Skeleton className="h-24 w-16" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !feature) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Feature not found</h2>
        <p className="text-gray-500 mb-6">The feature request you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="text-blue-600 hover:underline">← Back to home</Link>
      </div>
    );
  }

  const getStatusLabel = (status: string) => status.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  const getCategoryLabel = (cat: string) => cat === 'UI_UX' ? 'UI/UX' : cat.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </button>

      <div className="flex gap-6 flex-col md:flex-row">
        <div className="shrink-0 self-start md:sticky md:top-24">
          <VoteButton
            voteCount={feature.voteCount}
            hasVoted={feature.hasVoted}
            onVote={() => voteMutation.mutate({ featureId: feature._id, hasVoted: feature.hasVoted })}
            onLoginRequired={() => setShowLoginModal(true)}
            large
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={`status_${feature.status.toLowerCase()}` as any}>
              {getStatusLabel(feature.status)}
            </Badge>
            <Badge variant={`cat_${feature.category.toLowerCase()}` as any}>
              {getCategoryLabel(feature.category)}
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-8 pb-8 border-b">
            <span>By <span className="font-medium text-gray-900">{feature.author.name}</span></span>
            <span className="mx-2">·</span>
            <span>{formatDate(feature.createdAt)}</span>
            <span className="mx-2">·</span>
            <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1" /> {feature.commentCount} comments</span>
          </div>

          <div className="prose max-w-none text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {DOMPurify.sanitize(feature.description)}
            </ReactMarkdown>
          </div>

          <hr className="my-10" />

          <CommentSection featureId={feature._id} />
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={() => voteMutation.mutate({ featureId: feature._id, hasVoted: false })}
      />
    </div>
  );
}
