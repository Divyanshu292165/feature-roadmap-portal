import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { Input } from '../ui/Input';

export function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [inputValue, setInputValue] = useState(initialSearch);
  const debouncedSearch = useDebounce(inputValue, 300);

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      const newParams = new URLSearchParams(searchParams);
      if (debouncedSearch) {
        newParams.set('search', debouncedSearch);
      } else {
        newParams.delete('search');
      }
      setSearchParams(newParams, { replace: true });
    }
  }, [debouncedSearch, searchParams, setSearchParams]);

  const handleClear = () => {
    setInputValue('');
    searchParams.delete('search');
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="relative w-full max-w-md">
      <Input
        type="text"
        placeholder="Search features..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        icon={<Search className="h-4 w-4 text-muted-foreground" />}
        className="[&_input]:pe-9"
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
