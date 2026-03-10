import useDebounce from '@/hooks/use-debounce';
import { useOutsideClick } from '@/hooks/user-outside-click';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Loader, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import CustomButton from './CustomButton';

// 1. Define what "T" MUST have
interface Identifiable {
  id: number;
}

interface SelectSearchInputProps<T extends Identifiable> {
  value: T[];
  placeholder?: string;
  onChange: (value: T[]) => void;
  itemsMaxCount?: number | null;
  targetTable: string;
  renderItem: (item: T) => React.ReactNode;
  renderSearchItem: (item: T) => React.ReactNode;
  className?: string;
  addLink?: string | null;
  maxRows?: number;
}

const SelectSearchInput = <T extends Identifiable>({
  value: items,
  placeholder,
  itemsMaxCount,
  targetTable,
  renderItem,
  renderSearchItem,
  onChange,
  className,
  addLink,
  maxRows = 1,
}: SelectSearchInputProps<T>) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const contRef = useOutsideClick<HTMLDivElement>(() => {
    setSearch('');
    setSearchResults([]);
  });

  const selectedRows: string[] = [
    'grid grid-cols-1 place-content-start gap-2',
    'grid grid-cols-1 place-content-start md:grid-cols-2 gap-2',
    'grid grid-cols-1 place-content-start md:grid-cols-2 lg:grid-cols-3 gap-2',
    'grid grid-cols-1 place-content-start md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2', //..
  ];

  // Helper to get Tomorrow's date for 'Create' mode

  const handleRemoveItem = (id: number) => {
    //..
    const newList = items.filter((item) => item.id !== id);

    onChange(newList);
  };

  const isSelected = (id: number) => {
    // return data.variant_ids.includes(id);
    return items.some((item) => item.id === id);
  };

  const handleSearchResultsClick = (item: T) => {
    //.
    if (!isSelected(item.id)) {
      if (itemsMaxCount && items.length >= itemsMaxCount) {
        return;
      }
      const newList = [...items, item];
      onChange(newList);
    } else {
      handleRemoveItem(item.id);
    }
    setSearch('');
    setSearchResults([]);
  };

  // Fetch variants when debounced search changes
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const performSearch = async () => {
      setIsSearching(true);
      try {
        // Native fetch call
        const response = await fetch(`/admin/${targetTable}/search?search=${encodeURIComponent(debouncedSearch)}`, {
          signal,
        });
        if (!response.ok) throw new Error('Search failed');

        const results = await response.json();
        // console.log('Search results:', results);
        setSearchResults(results);
      } catch (err: any) {
        // if (err.name !== 'AbortError') {
        //     console.error('Search error:', err);
        // }
        console.log('error', err);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();

    // Cleanup function: cancels the fetch if the user types again immediately
    return () => controller.abort();
  }, [debouncedSearch]);

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="relative">
        <div className="group flex divide-x divide-gray-400 overflow-hidden rounded border border-gray-400 bg-white focus-within:ring-1 focus-within:ring-sky-900">
          {addLink && (
            <Link
              href={addLink}
              className="block flex items-center justify-center bg-gray-200 px-3 text-xs font-bold tracking-wider text-gray-500 uppercase hover:bg-gray-100"
            >
              + NEW
            </Link>
          )}
          <input
            type="text"
            value={search}
            placeholder={placeholder || `Search Items...`}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-2 py-1 outline-none"
          />

          {search.length > 0 && (
            <button
              onClick={() => setSearch('')} //
              className="cursor-pointer bg-gray-200 px-2 text-xs font-semibold tracking-wider text-gray-500 uppercase outline-none hover:bg-gray-100"
            >
              Clear
            </button>
          )}
        </div>
        {search.length > 0 && (
          <div className="absolute top-full z-10 mt-1 max-h-38 w-full overflow-y-auto rounded border border-gray-400 bg-white shadow-lg">
            {isSearching ? (
              <div className="flex h-16 w-full items-center justify-center gap-x-2 p-4 text-sm text-gray-400">
                <Loader size={20} className="animate-spin" />
                <p>Searching..</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-gray-300">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 hover:bg-sky-50"
                  >
                    {renderSearchItem(result)}

                    {isSelected(result.id) ? (
                      <CustomButton
                        label="Remove"
                        size="xs"
                        color="danger"
                        onClick={() => handleSearchResultsClick(result)}
                        className="min-w-16 flex-shrink-0"
                      />
                    ) : (
                      <CustomButton
                        label="Select"
                        size="xs"
                        color="primary"
                        onClick={() => handleSearchResultsClick(result)}
                        className="min-w-16 flex-shrink-0"
                        disabled={itemsMaxCount ? items.length >= itemsMaxCount : false}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-16 w-full items-center justify-center text-gray-400">
                {debouncedSearch.length > 0 ? (
                  <p>
                    No results found for <span className="font-bold">"{search}"</span>
                  </p>
                ) : (
                  <p>Results will appear here...</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        {items.length > 0 ? (
          <div
            className={cn(
              'min-h-20 rounded border border-gray-400 bg-white p-2',
              selectedRows[Math.min(4, maxRows) - 1],
            )}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="flex divide-x divide-gray-400 overflow-hidden rounded border border-gray-400 bg-gray-200 shadow"
              >
                <div className="flex-1">{renderItem(item)}</div>
                <button className="cursor-pointer px-2 hover:bg-gray-100" onClick={() => handleRemoveItem(item.id)}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-20 rounded border border-gray-400 bg-white px-2 py-1.5 text-gray-600/50">
            No items selected.
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectSearchInput;
