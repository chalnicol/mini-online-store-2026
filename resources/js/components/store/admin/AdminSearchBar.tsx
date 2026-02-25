import useDebounce from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface SearchBarProps {
    table: string;
    filters: Record<string, any>; // Ensure this matches your props
    className?: string;
}

const AdminSearchBar = ({ table, filters, className }: SearchBarProps) => {
    // Initialize state from existing filters so the input doesn't clear on refresh
    const [search, setSearch] = useState(filters.search || '');
    const debouncedSearch = useDebounce(search, 300);

    // Prevent the first render from firing a request if the search is already empty
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // 1. Create the base params without the search
        // We use 'any' here to allow flexible key additions for the URL
        const queryParams: Record<string, any> = { ...filters };

        // 2. Only add the search key if it's NOT empty
        if (debouncedSearch) {
            queryParams.search = debouncedSearch;
        } else {
            // If empty, we explicitly remove it from the filters copy
            // This is safer than 'delete' for TS
            const { search, ...rest } = queryParams;

            // Now 'rest' contains everything except the search key
            router.get(`/admin/${table}`, rest, {
                preserveState: true,
                replace: true,
                only: [table],
            });
            return; // Exit early since we fired the request
        }

        // 3. Fire the request for when search has a value
        router.get(`/admin/${table}`, queryParams, {
            preserveState: true,
            replace: true,
            only: [table],
        });
    }, [debouncedSearch]);

    return (
        <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${table}...`}
            className={cn(
                'w-full rounded border border-gray-400 bg-white px-2 py-1 outline-none focus:ring-1 focus:ring-sky-900',
                className,
            )}
        />
    );
};

export default AdminSearchBar;
