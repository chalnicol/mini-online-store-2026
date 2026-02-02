import useDebounce from '@/hooks/use-debounce';
import type { Category } from '@/types/store';
import { router, usePage } from '@inertiajs/react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

export interface FilterSearchContextType {
    categories: Category[];
    selectedCategorySlug: string | null;
    selectedCategory: string | null;
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
    view: 'grid' | 'list';
    changeView: (view: 'grid' | 'list') => void;
    resetAll: () => void;
    getBreadcrumbs: (id: number) => Category[];
    loadMore: () => void;
    expandedId: number | null;
    setExpanded: (id: number | null) => void;
}

export const FilterSearchContext = React.createContext<
    FilterSearchContextType | undefined
>(undefined);

export const FilterSearchProvider: React.FC<{
    children: React.ReactNode;
    initialCategories: Category[];
}> = ({ children, initialCategories }) => {
    const { props } = usePage();

    // Safely extract filters with defaults
    const serverFilters = (props?.filters as Record<string, string>) || {};

    const [searchTerm, setSearchTerm] = useState<string>(
        serverFilters.search || '',
    );
    const [selectedCategorySlug, setSelectedCategorySlug] = useState<
        string | null
    >(serverFilters.category || null);
    const [sortOrder, setSortOrder] = useState<string>(
        serverFilters.sort || 'date-desc',
    );

    const [isCategoryListOpen, setIsCategoryListOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const debouncedSearch = useDebounce(searchTerm, 400);
    const isFirstRender = useRef(true);
    const isResetting = useRef(false);
    const isNavigatingManually = useRef(false);

    useEffect(() => {
        const params = (props?.filters as any) ?? {};

        // Only update if the value actually changed to avoid infinite loops
        if (params.search !== undefined && params.search !== searchTerm) {
            setSearchTerm(params.search ?? '');
        }
        if (
            params.category !== undefined &&
            params.category !== selectedCategorySlug
        ) {
            setSelectedCategorySlug(params.category ?? null);
        }
        if (params.sort !== undefined && params.sort !== sortOrder) {
            setSortOrder(params.sort ?? 'date-desc');
        }
    }, [props.filters]);

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
                {
                    replace: true,
                    preserveState: false,
                    onFinish: () => {
                        isResetting.current = false;
                    }, // Add this
                },
            );
        }
    }, []);

    // 3. URL SYNC
    useEffect(() => {
        // 1. Exit if it's the initial load or a reset
        // if (isFirstRender.current || isResetting.current) {
        //     isFirstRender.current = false;
        //     return;
        // }
        if (
            isFirstRender.current ||
            isResetting.current ||
            isNavigatingManually.current
        ) {
            isFirstRender.current = false;
            return;
        }

        const params: Record<string, any> = {
            search: debouncedSearch,
            category: selectedCategorySlug,
            sort: sortOrder,
        };

        // Use Object.keys to be safer than Object.entries if you're worried about types
        const cleanParams: Record<string, any> = {};
        Object.keys(params).forEach((key) => {
            const val = (params as any)[key];
            if (
                val !== null &&
                val !== undefined &&
                val !== '' &&
                val !== 'date-desc'
            ) {
                cleanParams[key] = val;
            }
        });

        const currentPath = window.location.pathname;
        const hasActiveFilters = Object.keys(cleanParams).length > 0;

        // CHANGE: Identify your product listing path (e.g., '/')
        const productListPath = '/';

        // LOGIC:
        // - If I have active filters, I should be on the product list page.
        // - If I am on a subpage (like /pages/about) and I have NO filters, DO NOTHING.
        if (!hasActiveFilters && currentPath !== productListPath) {
            return;
        }

        // Determine destination
        const destination = hasActiveFilters ? productListPath : currentPath;

        router.get(destination, cleanParams, {
            preserveState: true,
            replace: true,
            // Only use 'only' if we aren't changing pages
            ...(destination === currentPath
                ? { only: ['data', 'filters'] }
                : {}),
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

    const selectedCategory = useMemo(() => {
        if (!selectedCategorySlug || flatCategories.length === 0) return null;
        return (
            flatCategories.find((c) => c.slug === selectedCategorySlug)?.name ??
            null
        );
    }, [selectedCategorySlug, flatCategories]);

    const value: FilterSearchContextType = {
        categories: initialCategories ?? [],
        expandedId,
        setExpanded: setExpandedId,
        selectedCategory,
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
        view,
        changeView: setView,
        resetAll: () => {
            // setSearchTerm('');
            // setSelectedCategorySlug(null);
            // setSortOrder('date-desc');
            isNavigatingManually.current = true; // Lock the useEffect
            setSearchTerm('');
            setSelectedCategorySlug(null);
            setSortOrder('date-desc');
            setExpandedId(null);

            // Manually go where you want to go
            router.get(
                '/',
                {},
                {
                    onFinish: () => {
                        isNavigatingManually.current = false;
                    },
                },
            );
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
