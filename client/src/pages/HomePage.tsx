import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/features/SearchBar';
import { FilterBar } from '../components/features/FilterBar';
import { FeatureList } from '../components/features/FeatureList';
import { useFeatureList } from '../hooks/useFeatures';
import { useSearchParams } from 'react-router-dom';

export default function HomePage() {
  const [searchParams] = useSearchParams();
  
  const params = {
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
    sort: (searchParams.get('sort') as any) || undefined,
    category: (searchParams.get('category') as any) || undefined,
    status: (searchParams.get('status') as any) || undefined,
    search: searchParams.get('search') || undefined
  };

  const { data, isLoading, error } = useFeatureList(params);

  return (
    <div>
      <div className="bg-blue-600 text-white rounded-xl p-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between">
        <div className="mb-6 sm:mb-0 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Shape our product roadmap</h1>
          <p className="text-blue-100 text-lg">Submit, discuss, and vote for the features you want to see built next.</p>
        </div>
        <Link to="/features/new">
          <Button size="lg" variant="secondary" className="bg-amber-400 hover:bg-amber-300 border-amber-400 text-neutral-900 font-semibold shadow-sm">Submit a Feature</Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="w-full md:hidden mb-4">
          <SearchBar />
        </div>
        <FilterBar />
      </div>

      <FeatureList 
        features={data?.data} 
        isLoading={isLoading} 
        error={error} 
        pagination={data?.pagination} 
      />
    </div>
  );
}
