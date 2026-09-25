import { useRoadmap } from '../hooks/useFeatures';
import { KanbanBoard } from '../components/roadmap/KanbanBoard';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export default function RoadmapPage() {
  const { data: roadmapRes, isLoading, error } = useRoadmap();
  const data = roadmapRes?.data;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Roadmap</h1>
        <p className="text-gray-500">See what we're working on and what's coming next.</p>
      </div>

      {error ? (
        <EmptyState title="Failed to load roadmap" description={error.message} />
      ) : isLoading ? (
        <div className="flex gap-6 overflow-x-auto">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 min-w-[300px] space-y-4">
              <Skeleton className="h-8 w-1/3 mb-4" />
              {[1, 2].map(j => <Skeleton key={j} className="h-32 w-full rounded-lg" />)}
            </div>
          ))}
        </div>
      ) : data ? (
        <KanbanBoard data={data} />
      ) : null}
    </div>
  );
}
