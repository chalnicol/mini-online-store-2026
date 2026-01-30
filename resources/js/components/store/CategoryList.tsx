import CategoryBranch from '@/components/store/CategoryBranch';
import { useFilterSearch } from '@/context/FilterSearchContext';
import CustomButton from './CustomButton';

const CategoryList: React.FC = () => {
    const {
        categories,
        path,
        searchTerm,
        setSearched,
        resetAll,
        setSelected,
        selectedCategoryId,
    } = useFilterSearch();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelected(null);
        setSearched(e.target.value);
    };

    // Check if any top-level category is visible
    const hasResults = categories.some(
        (cat) => !searchTerm.trim() || path.includes(cat.id),
    );

    const buttonDisabled = searchTerm == '' && !selectedCategoryId;

    return (
        <div>
            <div className="mb-3 flex space-y-1 gap-x-1.5">
                <input
                    type="search"
                    className="w-full rounded border border-gray-400 bg-white px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-sky-900"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search categories"
                />
                <CustomButton
                    label="Reset"
                    size="sm"
                    color="primary"
                    onClick={resetAll}
                    disabled={buttonDisabled}
                    className="h-full flex-none py-1"
                />
            </div>

            {!hasResults && (
                <div className="mb-2 rounded border border-gray-400 bg-sky-100 px-2 py-1.5 text-sm font-semibold text-gray-700 shadow">
                    No categories match your search.
                </div>
            )}

            <div className="space-y-1.5">
                {categories.map((category) => (
                    <CategoryBranch key={category.id} category={category} />
                ))}
            </div>
        </div>
    );
};

export default CategoryList;
