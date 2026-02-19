import { cn } from '@/lib/utils';
import { Meta } from '@/types/store';
import { Link } from '@inertiajs/react';

interface PaginationProps {
    meta: Meta;
    type?: 'simple' | 'advanced';
    className?: string;
}

const Pagination = ({ meta, type = 'simple', className }: PaginationProps) => {
    const getLabel = (label: string) => {
        if (label.includes('Previous')) return 'Previous';
        if (label.includes('Next')) return 'Next';
        return label;
    };

    // --- LOGIC TO FILTER LINKS ---
    const getFilteredLinks = () => {
        const allLinks = meta.links;
        if (allLinks.length <= 10) return allLinks; // Show all if total pages are low

        return allLinks.filter((link, index) => {
            // Always keep Previous (first) and Next (last)
            if (index === 0 || index === allLinks.length - 1) return true;

            const labelAsNumber = parseInt(link.label);
            if (isNaN(labelAsNumber)) return true; // Keep non-numeric labels just in case

            const currentPage = meta.current_page;
            const windowSize = 2; // How many pages to show on each side of active

            // Keep First page, Last page, and pages around the Current Page
            const isFirstPage = labelAsNumber === 1;
            const isLastPage = labelAsNumber === meta.last_page;
            const isWithinWindow =
                labelAsNumber >= currentPage - windowSize &&
                labelAsNumber <= currentPage + windowSize;

            return isFirstPage || isLastPage || isWithinWindow;
        });
    };

    const prevLink = meta.links[0];
    const nextLink = meta.links[meta.links.length - 1];
    const filteredLinks = getFilteredLinks();

    return (
        <div className={cn('mt-6', className)}>
            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
                {type === 'simple' && (
                    <>
                        <Link
                            href={prevLink?.url || '#'}
                            disabled={!prevLink?.url}
                            preserveScroll
                            className={cn(
                                'block rounded border bg-sky-900 px-3 py-1 font-bold text-white transition',
                                {
                                    'pointer-events-none border-gray-200 bg-gray-200 text-gray-400':
                                        !prevLink?.url,
                                },
                            )}
                        >
                            Previous
                        </Link>
                        <Link
                            href={nextLink?.url || '#'}
                            disabled={!nextLink?.url}
                            preserveScroll
                            className={cn(
                                'block rounded border bg-sky-900 px-3 py-1 font-bold text-white transition',
                                {
                                    'pointer-events-none border-gray-200 bg-gray-200 text-gray-400':
                                        !nextLink?.url,
                                },
                            )}
                        >
                            Next
                        </Link>
                    </>
                )}

                {type === 'advanced' && (
                    <>
                        {filteredLinks.map((link, i) => {
                            // Logic to add ellipsis dots if there's a gap
                            const currentLabel = parseInt(link.label);
                            const prevLabel = parseInt(
                                filteredLinks[i - 1]?.label,
                            );
                            const showDots =
                                i > 1 &&
                                !isNaN(currentLabel) &&
                                !isNaN(prevLabel) &&
                                currentLabel > prevLabel + 1;

                            return (
                                <div
                                    key={i}
                                    className="flex items-center gap-x-1.5"
                                >
                                    {showDots && (
                                        <span className="px-1 text-gray-400">
                                            ...
                                        </span>
                                    )}
                                    <Link
                                        href={link.url || '#'}
                                        disabled={!link.url || link.active}
                                        preserveScroll
                                        preserveState
                                        className={cn(
                                            'block cursor-pointer rounded border border-gray-400 bg-gray-200 px-3 py-0.5 text-sm font-bold text-gray-800 transition select-none hover:bg-gray-100',
                                            {
                                                'pointer-events-none cursor-default border-sky-800 bg-sky-900 text-white':
                                                    link.active,
                                                'pointer-events-none cursor-default opacity-50':
                                                    !link.url && !link.active,
                                            },
                                        )}
                                    >
                                        {getLabel(link.label)}
                                    </Link>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
            <p className="my-2 text-xs font-semibold text-slate-500">
                Showing {meta.from} to {meta.to} of {meta.total} items
            </p>
        </div>
    );
};

export default Pagination;
