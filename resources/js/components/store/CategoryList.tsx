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
            <div className="sticky top-12 z-40 mb-2 space-y-1 bg-white py-2.5">
                <p className="text-xs font-semibold tracking-wider">
                    Selected:{' '}
                </p>
                <div className="flex gap-x-2 font-semibold text-gray-700">
                    <p className="flex flex-1 items-center rounded border border-gray-400 bg-gray-50 px-2 text-sm">
                        {selectedCategory || '- None -'}
                    </p>
                    <CustomButton
                        label="Reset"
                        // size="sm"
                        color="primary"
                        onClick={resetAll}
                        disabled={buttonDisabled}
                        className="py-1"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                {categories.map((category) => (
                    <CategoryBranch key={category.id} category={category} />
                ))}
            </div>
            <p className="py-4 text-center text-xs">- End of Category List -</p>
        </div>
    );
};

export default CategoryList;
