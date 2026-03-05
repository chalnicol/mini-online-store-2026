import useDebounce from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Loader, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import BaseModal from './BaseModal';
import CustomButton from './CustomButton';

// 1. Define what "T" MUST have
interface Identifiable {
  id: number;
}

interface SelectSearchModalProps<T extends Identifiable> {
  selected: T[];
  label: string;
  placeholder?: string;
  itemsMaxCount?: number | null;
  targetTable: string;
  renderSearchItem: (item: T) => React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
  onSubmit: (value: number[]) => void;
  onClose: () => void;
}

const SelectSearchModal = <T extends Identifiable>({
  selected,
  label,
  placeholder,
  itemsMaxCount,
  targetTable,
  renderSearchItem,
  renderItem,
  onSubmit,
  onClose,
}: SelectSearchModalProps<T>) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(search, 500);

  const [itemsSelected, setItemsSelected] = useState<T[]>(selected);
  // Helper to get Tomorrow's date for 'Create' mode

  const handleManageItem = (action: 'add' | 'remove', item: T) => {
    if (action == 'add') {
      if (itemsMaxCount && itemsSelected.length >= itemsMaxCount) {
        return;
      }
      setItemsSelected((prev) => [...prev, item]);
    } else if (action == 'remove') {
      setItemsSelected((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  const isSelected = (id: number) => {
    return itemsSelected.some((item) => item.id === id);
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
    <BaseModal size="lg">
      <div className="flex justify-end">
        <button
          className="cursor-pointer rounded-t bg-sky-900 px-2 py-0.5 text-xs text-white hover:bg-sky-800"
          onClick={onClose}
        >
          CLOSE
        </button>
      </div>
      <div className="space-y-2 rounded rounded-tr-none border border-gray-400 bg-white p-3 shadow-lg">
        <h2 className="font-semibold">{label}</h2>
        <input
          autoFocus
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded border border-gray-400 bg-white px-2 py-1 outline-none focus:ring-1 focus:ring-sky-900"
          placeholder={placeholder || `Search ${targetTable}...`}
        />
        <div className="h-30 w-full overflow-y-auto rounded border border-gray-400 bg-white">
          {isSearching ? (
            <div className="flex h-full w-full items-center justify-center gap-x-2 p-4 text-sm text-gray-400">
              <Loader size={20} className="animate-spin" />
              <p>Searching..</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y divide-gray-300">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className={cn(
                    'flex cursor-pointer items-center justify-between px-2 py-1 transition-colors hover:bg-sky-50',
                    isSelected(result.id) && 'bg-sky-100',
                  )}
                >
                  {renderSearchItem(result)}
                  {isSelected(result.id) ? (
                    <CustomButton
                      size="xs"
                      label="Remove"
                      color="danger" //..
                      onClick={() => handleManageItem('remove', result)}
                    />
                  ) : (
                    <CustomButton
                      size="xs"
                      label="Select"
                      color="primary"
                      onClick={() => handleManageItem('add', result)}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              {debouncedSearch.length > 0 ? (
                <p>
                  No results found for <span className="font-bold">"{search}"</span>
                </p>
              ) : (
                <p>Search results will appear here...</p>
              )}
            </div>
          )}
        </div>

        <div className="h-20 rounded border border-gray-400 bg-gray-200">
          {itemsSelected.length > 0 ? (
            <div className="grid h-full grid-cols-1 place-content-start gap-2 overflow-y-auto p-1.5 md:grid-cols-2">
              {itemsSelected.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between divide-x divide-gray-400 overflow-hidden rounded border border-gray-400 bg-white shadow"
                >
                  {renderItem(item)}
                  <button
                    className="cursor-pointer px-2 hover:bg-gray-50"
                    onClick={() => handleManageItem('remove', item)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="flex h-full w-full items-center justify-center font-semibold">Selected items here</p>
          )}
        </div>

        <div className="flex items-center gap-x-2">
          <CustomButton
            label="Cancel"
            // size="sm"
            color="secondary" //..
            onClick={onClose}
          />
          <CustomButton
            label="Submit"
            // size="sm"
            color="primary" //..
            onClick={() => onSubmit(selected.map((s) => s.id))}
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default SelectSearchModal;
