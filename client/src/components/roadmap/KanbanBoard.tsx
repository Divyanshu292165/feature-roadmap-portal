import { RoadmapData } from '../../types';
import { RoadmapCard } from './RoadmapCard';

export function KanbanBoard({ data }: { data: RoadmapData }) {
  const columns = [
    { id: 'PLANNED', title: 'Planned', features: data.PLANNED, color: 'bg-blue-100 text-blue-800' },
    { id: 'IN_PROGRESS', title: 'In Progress', features: data.IN_PROGRESS, color: 'bg-amber-100 text-amber-800' },
    { id: 'COMPLETED', title: 'Completed', features: data.COMPLETED, color: 'bg-green-100 text-green-800' }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {columns.map(col => (
        <div key={col.id} className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-900">{col.title}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.color}`}>
              {col.features.length}
            </span>
          </div>
          
          <div className="flex flex-col gap-3">
            {col.features.length === 0 ? (
              <div className="bg-gray-50 border border-dashed rounded-lg p-6 text-center text-sm text-gray-500">
                No features {col.title.toLowerCase()}
              </div>
            ) : (
              col.features.map(feature => (
                <RoadmapCard key={feature._id} feature={feature} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
