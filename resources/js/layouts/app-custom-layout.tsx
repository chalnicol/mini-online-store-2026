import FilterSearch from '@/components/store/FilterSearch';
import Navbar from '@/components/store/Navbar';
import { FilterSearchProvider } from '@/context/FilterSearchContext';
import { Category } from '@/types/store';
import { usePage } from '@inertiajs/react';

interface CustomLayoutProps {
    children: React.ReactNode;
    showFilterSearch?: boolean;
}

const CustomLayout: React.FC<CustomLayoutProps> = ({
    children,
    showFilterSearch = false,
}) => {
    const { categories } = usePage<{ categories: Category[] }>().props;

    return (
        <FilterSearchProvider initialCategories={categories}>
            <div className="flex min-h-dvh flex-col bg-gray-50 text-gray-600">
                <div className="sticky top-0 z-50 flex-none">
                    <Navbar />
                </div>
                <main className="relative flex-grow">
                    {showFilterSearch == true && (
                        <div className="mx-auto max-w-7xl px-4">
                            <FilterSearch />
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </FilterSearchProvider>
    );
};

export default CustomLayout;
