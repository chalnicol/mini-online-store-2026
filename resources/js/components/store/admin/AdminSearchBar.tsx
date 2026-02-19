import useDebounce from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface SearchBarProps {
    table: string;
    filters: Record<string, string>;
    className?: string;
}

const AdminSearchBar = ({ table, filters, className }: SearchBarProps) => {
    const [search, setSearch] = useState('');

    // Use your custom hook - assuming it returns the debounced value
    const debouncedSearch = useDebounce(search, 300);

    // const userList = Array.isArray(users) ? users : users.data;

    // Trigger the Inertia request when the debounced value changes
    useEffect(() => {
        // 1. Create a data object for the request
        const queryParams: any = {};

        // 2. Only add 'search' to the request if it has a value
        if (debouncedSearch) {
            queryParams.search = debouncedSearch;
        }

        // 3. Fire the request
        router.get(`/admin/${table}`, queryParams, {
            preserveState: true,
            replace: true,
            only: [table],
            // Optional: if the search is empty, we don't want to
            // "stack" empty searches in the browser history
            onBefore: () =>
                !debouncedSearch && !filters.search ? false : true,
        });
    }, [debouncedSearch]);

    return (
        <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${table}`}
            className={cn(
                'w-full rounded border border-gray-400 bg-white px-2 py-1 outline-none focus:ring-1 focus:ring-sky-900',
                className,
            )}
        />
    );
};

export default AdminSearchBar;
