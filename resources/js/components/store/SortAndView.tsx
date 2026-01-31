import { useFilterSearch } from '@/context/FilterSearchContext';
import { Grid2X2, List, X } from 'lucide-react';
import React from 'react';

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
    } = useFilterSearch();

    const options: { value: string; label: string }[] = [
        { value: 'name-asc', label: 'Name: A to Z' },
        { value: 'name-desc', label: 'Name: Z to A' },
        { value: 'price-asc', label: 'Price: Low to High' },
        { value: 'price-desc', label: 'Price: High to Low' },
        { value: 'rating-desc', label: 'Rating: High to Low' },
        { value: 'rating-asc', label: 'Rating: Low to High' },
        { value: 'date-desc', label: 'Newest' },
        { value: 'date-asc', label: 'Oldest' },
    ];
    return (
        <div
            className={`flex flex-col gap-x-4 gap-y-2 text-xs md:flex-row md:items-center ${className}`}
        >
            {(searchTerm || selectedCategory) && (
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {searchTerm && (
                        <div className="flex overflow-hidden rounded border bg-sky-900 text-white">
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
                        <div className="flex overflow-hidden rounded border bg-sky-900 text-white">
                            <p className="flex items-center px-2 py-1 font-semibold">
                                Category: {selectedCategory}
                            </p>
                            <button
                                className="cursor-pointer border-s border-white px-1 hover:bg-sky-800"
                                onClick={() => setSelectedSlug(null)}
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
                        <span>View :</span>
                        <div className="flex">
                            <button
                                className={`text flex w-10 justify-center rounded-l border border-gray-400 p-1 ${
                                    view === 'grid'
                                        ? 'bg-sky-900 text-white'
                                        : 'cursor-pointer shadow hover:bg-gray-100'
                                }`}
                                onClick={() => changeView('grid')}
                            >
                                <Grid2X2 size={17} />
                            </button>
                            <button
                                className={`text flex w-10 justify-center rounded-r border border-s-0 border-gray-400 p-1 ${
                                    view === 'list'
                                        ? 'bg-sky-900 text-white'
                                        : 'cursor-pointer shadow hover:bg-gray-100'
                                }`}
                                onClick={() => changeView('list')}
                            >
                                <List size={17} className="" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-1">
                        <span>Sort by:</span>
                        <select
                            className="rounded border border-gray-400 bg-white px-2 py-1 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                            value={
                                typeof sortOrder === 'string'
                                    ? sortOrder
                                    : 'date-desc'
                            }
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SortAndView;
