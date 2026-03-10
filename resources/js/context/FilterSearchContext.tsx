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
  activePath: number[];
  breadcrumbs: Category[];
  isProcessing: boolean;
  isCategoryListOpen: boolean;
  showCategoryList: (show: boolean) => void;
  view: 'grid' | 'list';
  changeView: (view: 'grid' | 'list') => void;
  resetAll: () => void;
  getBreadcrumbs: (id: number) => Category[];
  expandedId: number | null;
  setExpanded: (id: number | null) => void;
}

export const FilterSearchContext = React.createContext<FilterSearchContextType | undefined>(undefined);

export const FilterSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { props } = usePage();

  const initialCategories = (props?.categories as Category[]) || [];
  const serverFilters = (props?.filters as Record<string, string>) || {};

  const [searchTerm, setSearchTerm] = useState<string>(serverFilters.search || '');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(serverFilters.category || null);
  const [sortOrder, setSortOrder] = useState<string>(serverFilters.sort || 'date-desc');
  const [isCategoryListOpen, setIsCategoryListOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 400);
  const isFirstRender = useRef(true);
  const isNavigatingManually = useRef(false);

  // Sync local state when Inertia navigates (back/forward, partial reloads)
  useEffect(() => {
    const params = (props?.filters as Record<string, string>) ?? {};

    if (params.search !== undefined && params.search !== searchTerm) {
      setSearchTerm(params.search ?? '');
    }
    if (params.category !== undefined && params.category !== selectedCategorySlug) {
      setSelectedCategorySlug(params.category ?? null);
    }
    if (params.sort !== undefined && params.sort !== sortOrder) {
      setSortOrder(params.sort ?? 'date-desc');
    }
  }, [props.filters]);

  // URL sync — only fires on '/'
  useEffect(() => {
    if (isFirstRender.current || isNavigatingManually.current) {
      isFirstRender.current = false;
      return;
    }

    if (window.location.pathname !== '/') return;

    const cleanParams: Record<string, string> = {};

    if (debouncedSearch) cleanParams.search = debouncedSearch;
    if (selectedCategorySlug) cleanParams.category = selectedCategorySlug;
    if (sortOrder && sortOrder !== 'date-desc') cleanParams.sort = sortOrder;

    router.get('/', cleanParams, {
      preserveState: true,
      replace: true,
      only: ['data', 'filters'],
      onBefore: () => setIsProcessing(true),
      onFinish: () => setIsProcessing(false),
    });
  }, [debouncedSearch, selectedCategorySlug, sortOrder]);

  // Non-root search redirect — waits for debounce before redirecting
  useEffect(() => {
    if (isFirstRender.current) return;
    if (window.location.pathname === '/') return;
    if (!debouncedSearch) return;

    router.get('/', { search: debouncedSearch }, { preserveState: false });
  }, [debouncedSearch]);

  const flatCategories = useMemo(() => {
    const flatten = (list: Category[]): Category[] => {
      if (!list || !Array.isArray(list)) return [];
      return list.reduce(
        (acc: Category[], item) => [...acc, item, ...(item.children ? flatten(item.children) : [])],
        [],
      );
    };
    return flatten(initialCategories);
  }, [initialCategories]);

  const { breadcrumbs, activePath } = useMemo(() => {
    const crumbs: Category[] = [];
    const pathIds: number[] = [];

    if (!selectedCategorySlug || flatCategories.length === 0) {
      return { breadcrumbs: [], activePath: [] };
    }

    const currentCat = flatCategories.find((c) => c.slug === selectedCategorySlug);

    if (currentCat) {
      let curr: Category | undefined = currentCat;

      while (curr) {
        crumbs.unshift(curr);
        pathIds.push(curr.id);

        const parentIdToFind: number | null | undefined = curr.parentId;
        curr = parentIdToFind ? flatCategories.find((c) => c.id === parentIdToFind) : undefined;
      }
    }

    return { breadcrumbs: crumbs, activePath: pathIds };
  }, [selectedCategorySlug, flatCategories]);

  const getBreadcrumbs = (id: number): Category[] => {
    const crumbs: Category[] = [];
    if (flatCategories.length === 0) return [];

    let curr = flatCategories.find((c) => c.id === id);

    while (curr) {
      crumbs.unshift(curr);
      const parentId = curr.parentId;
      curr = parentId ? flatCategories.find((c) => c.id === parentId) : undefined;
    }

    return crumbs;
  };

  const selectedCategory = useMemo(() => {
    if (!selectedCategorySlug || flatCategories.length === 0) return null;
    return flatCategories.find((c) => c.slug === selectedCategorySlug)?.name ?? null;
  }, [selectedCategorySlug, flatCategories]);

  const handleSetSelectedSlug = (slug: string | null) => {
    if (window.location.pathname !== '/') {
      router.get('/', { category: slug ?? undefined }, { preserveState: false });
      return;
    }
    setSelectedCategorySlug(slug);
  };

  const resetAll = () => {
    isNavigatingManually.current = true;
    setSearchTerm('');
    setSelectedCategorySlug(null);
    setSortOrder('date-desc');
    setExpandedId(null);

    router.get(
      '/',
      {},
      {
        onFinish: () => {
          isNavigatingManually.current = false;
        },
      },
    );
  };

  const value: FilterSearchContextType = {
    categories: initialCategories ?? [],
    expandedId,
    setExpanded: setExpandedId,
    selectedCategory,
    selectedCategorySlug,
    setSelectedSlug: handleSetSelectedSlug,
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
    resetAll,
  };

  return <FilterSearchContext.Provider value={value}>{children}</FilterSearchContext.Provider>;
};

export const useFilterSearch = () => {
  const context = useContext(FilterSearchContext);
  if (!context) throw new Error('useFilterSearch must be used within Provider');
  return context;
};
