import { useSearchParams } from 'react-router-dom';
import { FeatureCard } from './FeatureCard';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { FeatureRequest, PaginationInfo } from '../../types';
import { Lightbulb } from 'lucide-react';

interface FeatureListProps {
  features?: FeatureRequest[];
  isLoading: boolean;
  error: Error | null;
  pagination?: PaginationInfo;
}

export function FeatureList({ features, isLoading, error, pagination }: FeatureListProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  if (error) {
    return (
      <EmptyState
        title="Error loading features"
        description={error.message}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border rounded-lg bg-white">
            <Skeleton className="h-16 w-12" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!features?.length) {
    return (
      <EmptyState
        icon={<Lightbulb className="h-12 w-12" />}
        title="No features found"
        description="Try adjusting your search or filters to find what you're looking for."
      />
    );
  }

  const handlePageChange = (newPage: number) => {
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <FeatureCard key={feature._id} feature={feature} />
      ))}

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-between items-center pt-6 border-t mt-8">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page >= pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
