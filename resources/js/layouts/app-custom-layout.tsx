import FilterSearch from '@/components/store/FilterSearch';
import Navbar from '@/components/store/Navbar';
import { CartProvider } from '@/context/CartContext';
import { FilterSearchProvider } from '@/context/FilterSearchContext';

interface CustomLayoutProps {
    children: React.ReactNode;
    showFilterSearch?: boolean;
}

const CustomLayout: React.FC<CustomLayoutProps> = ({
    children,
    showFilterSearch = false,
}) => {
    // const { categories } = usePage<{ categories: Category[] }>().props;
    // const { props } = usePage<{ categories?: Category[] }>();
    // const categories = props.categories ?? [];

    return (
        <FilterSearchProvider>
            <CartProvider>
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
                        <div className="mx-auto max-w-7xl p-4">{children}</div>
                    </main>
                </div>
            </CartProvider>
        </FilterSearchProvider>
    );
};

export default CustomLayout;
