import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { FeatureRequest } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { VoteButton } from './VoteButton';
import { formatDate } from '../../lib/utils';
import { useVote } from '../../hooks/useVote';
import { useState } from 'react';
import { LoginModal } from '../auth/LoginModal';

export function FeatureCard({ feature }: { feature: FeatureRequest }) {
  const voteMutation = useVote();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const getStatusLabel = (status: string) => status.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  const getCategoryLabel = (cat: string) => cat === 'UI_UX' ? 'UI/UX' : cat.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

  return (
    <>
      <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow group flex gap-4">
        <div className="shrink-0">
          <VoteButton
            voteCount={feature.voteCount}
            hasVoted={feature.hasVoted}
            onVote={() => voteMutation.mutate({ featureId: feature._id, hasVoted: feature.hasVoted })}
            onLoginRequired={() => setShowLoginModal(true)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/features/${feature._id}`} className="block focus:outline-none focus:underline group-hover:text-blue-600 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">{feature.title}</h3>
          </Link>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{feature.description}</p>
          
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant={`status_${feature.status.toLowerCase()}` as any}>
              {getStatusLabel(feature.status)}
            </Badge>
            <Badge variant={`cat_${feature.category.toLowerCase()}` as any}>
              {getCategoryLabel(feature.category)}
            </Badge>
            
            <div className="flex items-center text-gray-500 ml-auto gap-4">
              <Link to={`/features/${feature._id}#comments`} className="flex items-center hover:text-gray-700">
                <MessageSquare className="h-4 w-4 mr-1.5" />
                <span>{feature.commentCount}</span>
              </Link>
              <div className="hidden sm:block text-xs">
                By {feature.author.name} · {formatDate(feature.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={() => voteMutation.mutate({ featureId: feature._id, hasVoted: false })}
      />
    </>
  );
}
