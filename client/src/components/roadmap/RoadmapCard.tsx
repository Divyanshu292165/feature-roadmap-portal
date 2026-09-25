import { Link } from 'react-router-dom';
import { MessageSquare, ArrowUp } from 'lucide-react';
import { FeatureRequest } from '../../types';
import { Badge } from '../ui/Badge';

export function RoadmapCard({ feature }: { feature: FeatureRequest }) {
  const getCategoryLabel = (cat: string) => cat === 'UI_UX' ? 'UI/UX' : cat.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');

  return (
    <Link to={`/features/${feature._id}`} className="block">
      <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{feature.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <Badge variant={`cat_${feature.category.toLowerCase()}` as any}>
            {getCategoryLabel(feature.category)}
          </Badge>
          
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>{feature.voteCount}</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              <span>{feature.commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
