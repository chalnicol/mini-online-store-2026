import { Grid2X2, List } from 'lucide-react';
import React from 'react';

interface SortAndViewProps {
    view: 'grid' | 'list';
    sortOption: string;
    onViewChange: (view: 'grid' | 'list') => void;
    onSortChange: (sortOption: string) => void;
    className?: string;
}

const SortAndView: React.FC<SortAndViewProps> = ({
    view,
    sortOption,
    className,
    onSortChange,
    onViewChange,
}) => {
    return (
        <div className={`mb-4 flex gap-4 text-xs ${className}`}>
            <div className="flex items-center gap-x-1">
                <span>View :</span>
                <div className="flex">
                    <button
                        className={`text flex w-10 justify-center rounded-l border border-gray-400 p-1 ${
                            view === 'grid'
                                ? 'bg-sky-900 text-white'
                                : 'cursor-pointer shadow hover:bg-gray-100'
                        }`}
                        onClick={() => onViewChange('grid')}
                    >
                        <Grid2X2 size={17} />
                    </button>
                    <button
                        className={`text flex w-10 justify-center rounded-r border border-s-0 border-gray-400 p-1 ${
                            view === 'list'
                                ? 'bg-sky-900 text-white'
                                : 'cursor-pointer shadow hover:bg-gray-100'
                        }`}
                        onClick={() => onViewChange('list')}
                    >
                        <List size={17} className="" />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-x-1">
                <span>Sort by:</span>
                <select
                    className="rounded border border-gray-400 bg-white px-2 py-1 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    value={sortOption}
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Rating: High to Low</option>
                    <option value="rating-asc">Rating: Low to High</option>
                    <option value="date-desc">Newest</option>
                    <option value="date-asc">Oldest</option>
                </select>
            </div>
        </div>
    );
};

export default SortAndView;
