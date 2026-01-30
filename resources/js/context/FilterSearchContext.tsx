import useDebounce from '@/hooks/use-debounce';
import type { Category } from '@/types/store';
import { router, usePage } from '@inertiajs/react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface FilterSearchContextType {
    categories: Category[];
    selectedCategorySlug: string | null;
    setSelectedSlug: (slug: string | null) => void;
    searchTerm: string;
    setSearched: (term: string) => void;
    sortOrder: string;
    setSortOrder: (val: string) => void;
    activePath: number[]; // For the Tree expansion
    breadcrumbs: Category[]; // For the Breadcrumb UI
    isProcessing: boolean;
    isCategoryListOpen: boolean;
    showCategoryList: (show: boolean) => void;
    resetAll: () => void;
    getBreadcrumbs: (id: number) => Category[];
    loadMore: () => void;
}

export const FilterSearchContext = React.createContext<
    FilterSearchContextType | undefined
>(undefined);

export const FilterSearchProvider: React.FC<{
    children: React.ReactNode;
    initialCategories: Category[];
}> = ({ children, initialCategories }) => {
    const { props } = usePage();
    const serverFilters = (props?.filters as any) ?? {};

    // 1. State Initialization
    const [searchTerm, setSearchTerm] = useState<string>(
        () => serverFilters.search ?? '',
    );
    const [selectedCategorySlug, setSelectedCategorySlug] = useState<
        string | null
    >(() => serverFilters.category ?? null);
    const [sortOrder, setSortOrder] = useState<string>(
        () => serverFilters.sort ?? 'date-desc',
    );

    const [isCategoryListOpen, setIsCategoryListOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 400);
    const isFirstRender = useRef(true);
    const isResetting = useRef(false);

    // 2. HARD REFRESH RESET (Fixes the "URL won't clear" bug)
    useEffect(() => {
        const isReload = window.performance
            .getEntriesByType('navigation')
            .some((e) => (e as PerformanceNavigationTiming).type === 'reload');

        if (isReload && window.location.search !== '') {
            isResetting.current = true;
            setSearchTerm('');
            setSelectedCategorySlug(null);
            // Must use (url, data, options) signature
            router.get(
                window.location.pathname,
                {},
                { replace: true, preserveState: false },
            );
        }
    }, []);

    // 3. URL SYNC (Fixes the "Appends empty params" bug)
    useEffect(() => {
        if (isFirstRender.current || isResetting.current) {
            isFirstRender.current = false;
            return;
        }

        const params: Record<string, any> = {
            search: debouncedSearch,
            category: selectedCategorySlug,
            sort: sortOrder,
        };

        const cleanParams = Object.entries(params).reduce((acc, [key, val]) => {
            if (val !== null && val !== undefined && val !== '') acc[key] = val;
            return acc;
        }, {} as any);

        router.get(window.location.pathname, cleanParams, {
            preserveState: true,
            replace: true,
            only: ['data', 'filters'],
            onBefore: () => setIsProcessing(true),
            onFinish: () => setIsProcessing(false),
        });
    }, [debouncedSearch, selectedCategorySlug, sortOrder]);

    // 4. BREADCRUMB & PATH LOGIC (Restored)
    const flatCategories = useMemo(() => {
        const flatten = (list: Category[]): Category[] => {
            if (!list || !Array.isArray(list)) return [];
            return list.reduce(
                (acc: Category[], item) => [
                    ...acc,
                    item,
                    ...(item.children ? flatten(item.children) : []),
                ],
                [],
            );
        };
        return flatten(initialCategories);
    }, [initialCategories]);

    // 4. BREADCRUMB & PATH LOGIC
    const { breadcrumbs, activePath } = useMemo(() => {
        const crumbs: Category[] = [];
        const pathIds: number[] = [];

        if (!selectedCategorySlug || flatCategories.length === 0) {
            return { breadcrumbs: [], activePath: [] };
        }

        const currentCat = flatCategories.find(
            (c) => c.slug === selectedCategorySlug,
        );

        if (currentCat) {
            let curr: Category | undefined = currentCat;

            while (curr) {
                crumbs.unshift(curr);
                pathIds.push(curr.id);

                // Explicitly cast or capture the parentId to satisfy TS
                const parentIdToFind: number | null | undefined = curr.parentId;

                if (parentIdToFind) {
                    // Find the next parent
                    const nextParent: Category | undefined =
                        flatCategories.find((c) => c.id === parentIdToFind);
                    curr = nextParent;
                } else {
                    // No parentId means we've reached the root
                    curr = undefined;
                }
            }
        }

        return { breadcrumbs: crumbs, activePath: pathIds };
    }, [selectedCategorySlug, flatCategories]);

    const getBreadcrumbs = (id: number): Category[] => {
        const crumbs: Category[] = [];
        if (flatCategories.length === 0) return [];

        let curr = flatCategories.find((c) => c.id === id);

        while (curr) {
            crumbs.unshift(curr); // Push to front to keep Root -> Child order
            const parentId = curr.parentId;
            if (parentId) {
                curr = flatCategories.find((c) => c.id === parentId);
            } else {
                curr = undefined;
            }
        }

        return crumbs;
    };

    const value: FilterSearchContextType = {
        categories: initialCategories ?? [],
        selectedCategorySlug,
        setSelectedSlug: setSelectedCategorySlug,
        searchTerm,
        setSearched: setSearchTerm,
        sortOrder,
        setSortOrder,
        activePath,
        breadcrumbs,
        isProcessing,
        isCategoryListOpen,
        getBreadcrumbs,
        showCategoryList: setIsCategoryListOpen,
        resetAll: () => {
            setSearchTerm('');
            setSelectedCategorySlug(null);
            setSortOrder('date-desc');
        },
        loadMore: () => {
            const nextUrl = (props.data as any)?.links?.next;
            if (nextUrl && !isProcessing) {
                router.get(
                    nextUrl,
                    {},
                    {
                        preserveState: true,
                        preserveScroll: true,
                        only: ['data'],
                    },
                );
            }
        },
    };

    return (
        <FilterSearchContext.Provider value={value}>
            {children}
        </FilterSearchContext.Provider>
    );
};

export const useFilterSearch = () => {
    const context = useContext(FilterSearchContext);
    if (!context)
        throw new Error('useFilterSearch must be used within Provider');
    return context;
};
