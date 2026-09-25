import { useSearchParams } from 'react-router-dom';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const handleFilterChange = (key: string, value: string) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    searchParams.delete('page'); // reset to page 1 on filter change
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = searchParams.get('category') || searchParams.get('status') || searchParams.get('sort');

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
      <Select
        value={searchParams.get('sort') || ''}
        onValueChange={(value) => handleFilterChange('sort', value)}
        className="w-full sm:w-auto"
        options={[
          { value: '', label: 'Sort: Newest' },
          { value: 'upvotes', label: 'Most Upvoted' },
          { value: 'trending', label: 'Trending' },
          { value: 'newest', label: 'Newest' },
          { value: 'discussed', label: 'Most Discussed' },
        ]}
      />

      <Select
        value={searchParams.get('category') || ''}
        onValueChange={(value) => handleFilterChange('category', value)}
        className="w-full sm:w-auto"
        options={[
          { value: '', label: 'All Categories' },
          { value: 'UI_UX', label: 'UI/UX' },
          { value: 'INTEGRATIONS', label: 'Integrations' },
          { value: 'PERFORMANCE', label: 'Performance' },
          { value: 'GENERAL', label: 'General' },
        ]}
      />

      <Select
        value={searchParams.get('status') || ''}
        onValueChange={(value) => handleFilterChange('status', value)}
        className="w-full sm:w-auto"
        options={[
          { value: '', label: 'All Statuses' },
          { value: 'UNDER_REVIEW', label: 'Under Review' },
          { value: 'PLANNED', label: 'Planned' },
          { value: 'IN_PROGRESS', label: 'In Progress' },
          { value: 'COMPLETED', label: 'Completed' },
        ]}
      />

      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto">
          Clear Filters
        </Button>
      )}
    </div>
  );
}
