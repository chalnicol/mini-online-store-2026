import { useFilterSearch } from '@/context/FilterSearchContext';
import { SelectOptionsType } from '@/types/store';
import { Grid2X2, List, X } from 'lucide-react';
import React from 'react';
import CustomSelect from './CustomSelect';

interface SortAndViewProps {
    className?: string;
    itemsCount: number;
}

const SortAndView: React.FC<SortAndViewProps> = ({
    className,
    itemsCount = 0,
}) => {
    const {
        view,
        changeView,
        sortOrder,
        setSortOrder,
        selectedCategory,
        setSelectedSlug,
        searchTerm,
        setSearched,
        setExpanded,
    } = useFilterSearch();

    const options: SelectOptionsType<string>[] = [
        { id: 1, value: 'name-asc', label: 'Name: A to Z' },
        { id: 2, value: 'name-desc', label: 'Name: Z to A' },
        { id: 3, value: 'price-asc', label: 'Price: Low to High' },
        { id: 4, value: 'price-desc', label: 'Price: High to Low' },
        { id: 5, value: 'rating-desc', label: 'Rating: High to Low' },
        { id: 6, value: 'rating-asc', label: 'Rating: Low to High' },
        { id: 7, value: 'date-desc', label: 'Newest' },
        { id: 8, value: 'date-asc', label: 'Oldest' },
    ];
    return (
        <div
            className={`flex flex-col gap-x-4 gap-y-2 text-xs md:flex-row md:items-center ${className}`}
        >
            {(searchTerm || selectedCategory) && (
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {searchTerm && (
                        <div className="flex overflow-hidden rounded border bg-sky-900 text-white shadow">
                            <p className="flex items-center px-2 py-1 font-semibold">
                                Search: {searchTerm}
                            </p>
                            <button
                                className="cursor-pointer border-s border-white px-1 hover:bg-sky-800"
                                onClick={() => setSearched('')}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    {selectedCategory && (
                        <div className="flex overflow-hidden rounded border bg-sky-900 text-white shadow">
                            <p className="flex items-center px-2 py-1 font-semibold">
                                Category: {selectedCategory}
                            </p>
                            <button
                                className="cursor-pointer border-s border-white px-1 hover:bg-sky-800"
                                onClick={() => {
                                    setSelectedSlug('');
                                    setExpanded(null);
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}
            {itemsCount > 0 && (
                <div className="item-center flex flex-none gap-x-4">
                    <div className="flex items-center gap-x-1">
                        <span className="font-semibold">View</span>
                        <div className="flex">
                            <button
                                className={`rounded-l border px-2.5 py-0.5 ${
                                    view === 'grid'
                                        ? 'border-sky-800 bg-sky-900 text-white'
                                        : 'cursor-pointer border-gray-400 shadow hover:bg-gray-100'
                                }`}
                                onClick={() => changeView('grid')}
                            >
                                <Grid2X2 size={20} />
                            </button>
                            <button
                                className={`justify-center rounded-r border border-s-0 px-2.5 py-0.5 ${
                                    view === 'list'
                                        ? 'border-sky-800 bg-sky-900 text-white'
                                        : 'cursor-pointer border-gray-400 shadow hover:bg-gray-100'
                                }`}
                                onClick={() => changeView('list')}
                            >
                                <List size={20} className="" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-1">
                        <span className="font-semibold">Sort by</span>
                        <CustomSelect
                            // value={
                            //     typeof sortOrder === 'string'
                            //         ? sortOrder
                            //         : 'date-desc'
                            // }
                            value={sortOrder || 'date-desc'}
                            size="sm"
                            options={options}
                            onChange={setSortOrder}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SortAndView;
