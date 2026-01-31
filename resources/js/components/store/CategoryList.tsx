import CategoryBranch from '@/components/store/CategoryBranch';
import { useFilterSearch } from '@/context/FilterSearchContext';
import { useState } from 'react';
import CustomButton from './CustomButton';

const CategoryList: React.FC = () => {
    const {
        categories,
        selectedCategory,
        searchTerm,
        setSearched,
        resetAll,
        setSelectedSlug,
        selectedCategorySlug,
    } = useFilterSearch();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedSlug(null);
        setSearched(e.target.value);
    };

    // Check if any top-level category is visible
    // const hasResults = categories.some(
    //     // (cat) => activePath.includes(cat.id) || cat.name.includes(searchTerm),
    //     (cat) => activePath.includes(cat.id),
    // );

    const buttonDisabled = !selectedCategorySlug;

    const [categorySearchedTerm, setCategorySearchTerm] = useState('');

    return (
        <div>
            {/* <div className="mb-3 flex space-y-1 gap-x-1.5">
                <input
                    type="search"
                    className="w-full rounded border border-gray-400 bg-white px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-sky-900"
                    placeholder="Search categories"
                    value={categorySearchedTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                />

                <CustomButton
                    label="Reset"
                    size="sm"
                    color="primary"
                    onClick={resetAll}
                    disabled={buttonDisabled}
                    className="h-full flex-none py-1"
                />
            </div> */}

            {/* {!hasResults && (
                <div className="mb-2 rounded border border-gray-400 bg-sky-100 px-2 py-1.5 text-sm font-semibold text-gray-700 shadow">
                    No categories match your search.
                </div>
            )} */}

            <div className="sticky top-12 z-40 mb-2 bg-white py-2.5">
                <div className="space-y-2.5 font-semibold text-gray-700">
                    <p className="text-xs">
                        Selected :
                        <span className="ms-1">
                            {selectedCategory || 'None'}
                        </span>
                    </p>

                    <div className="inset-0 flex gap-x-1.5">
                        <input
                            type="search"
                            className="w-full rounded border border-gray-400 bg-white px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-sky-900"
                            placeholder="Search categories"
                            value={categorySearchedTerm}
                            onChange={(e) =>
                                setCategorySearchTerm(e.target.value)
                            }
                        />
                        <CustomButton
                            label="Reset"
                            size="sm"
                            color="primary"
                            onClick={resetAll}
                            disabled={buttonDisabled}
                            className="py-1"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                {categories.map((category) => (
                    <CategoryBranch key={category.id} category={category} />
                ))}
            </div>
            <p className="py-2 text-center text-xs">- End of Category List -</p>
        </div>
    );
};

export default CategoryList;
