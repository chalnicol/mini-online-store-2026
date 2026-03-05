import useDebounce from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import CustomButton from '../CustomButton';

interface SearchedUsers {
	id: number;
	lname: string;
	fname: string;
	email: string;
	isAttached: boolean;
}
const AttachUsersToVouchers = ({
	voucherId,
	loading,
	className,
	onUpdate,
}: {
	voucherId: number;
	loading: boolean;
	onUpdate: (action: 'attach' | 'detach', id: number) => void;
	className?: string;
}) => {
	const [search, setSearch] = useState('');
	const [searchResults, setSearchResults] = useState<SearchedUsers[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const debouncedSearch = useDebounce(search, 500);

	// Fetch variants when debounced search changes
	useEffect(() => {
		if (!debouncedSearch.trim()) {
			setSearchResults([]);
			return;
		}

		const controller = new AbortController();
		const signal = controller.signal;

		const performSearch = async () => {
			setIsSearching(true);
			try {
				// Native fetch call
				const response = await fetch(
					`/admin/vouchers/${voucherId}/search-users?search=${encodeURIComponent(debouncedSearch)}`,
					{ signal },
				);
				if (!response.ok) throw new Error('Search failed');

				const results = await response.json();
				// console.log('Search results:', results);
				setSearchResults(results);
			} catch (err: any) {
				// if (err.name !== 'AbortError') {
				//     console.error('Search error:', err);
				// }
				console.log('error', err);
			} finally {
				setIsSearching(false);
			}
		};

		performSearch();

		// Cleanup function: cancels the fetch if the user types again immediately
		return () => controller.abort();
	}, [debouncedSearch]);

	const handleResultsClick = (action: 'attach' | 'detach', id: number) => {
		onUpdate(action, id);
		setSearch('');
		setSearchResults([]);
	};

	return (
		<div className={cn('relative', className)}>
			{/* <TextInput
				type="search"
				value={search}
				placeholder="Search Users" //
				onChange={(e) => setSearch(e.target.value)}
			/> */}

			<div className="group flex items-center gap-x-2 overflow-hidden rounded border border-gray-400 px-2 py-1.5 focus-within:ring-1 focus-within:ring-sky-900">
				<input
					type="text"
					value={search}
					placeholder="Search Users"
					onChange={(e) => setSearch(e.target.value)}
					className="flex-1 outline-none"
				/>
				{search.length > 0 && (
					<button
						onClick={() => setSearch('')} //
						className="cursor-pointer rounded bg-sky-900 px-1.5 text-xs font-semibold tracking-wider text-white uppercase outline-none hover:bg-sky-800"
					>
						CLEAR
					</button>
				)}
			</div>
			{search.length > 0 && (
				<div className="absolute top-full z-10 mt-1 max-h-38 w-full overflow-y-auto rounded border border-gray-400 bg-white shadow-lg">
					{isSearching ? (
						<div className="flex h-16 w-full items-center justify-center gap-x-2 p-4 text-sm text-gray-400">
							<Loader size={20} className="animate-spin" />
							<p>Searching..</p>
						</div>
					) : searchResults.length > 0 ? (
						<div className="divide-y divide-gray-300">
							{searchResults.map((result) => (
								<div
									key={result.id}
									className="flex flex-col items-start gap-2 px-2.5 py-1.5 hover:bg-sky-50 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<p className="text-sm font-bold text-gray-500">
											{result.fname} {result.lname}
										</p>
										<p className="text-xs text-gray-500 text-slate-400">{result.email}</p>
									</div>
									{result.isAttached ? (
										<CustomButton
											label="Remove"
											size="sm"
											color="danger"
											onClick={() => handleResultsClick('detach', result.id)}
											loading={loading}
											disabled={loading}
											className="flex-shrink-0"
										/>
									) : (
										<CustomButton
											label="Assign"
											size="sm"
											color="primary"
											onClick={() => handleResultsClick('attach', result.id)}
											loading={loading}
											disabled={loading}
											className="flex-shrink-0"
										/>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="flex h-16 w-full items-center justify-center text-gray-400">
							{debouncedSearch.length > 0 ? (
								<p>
									No results found for <span className="font-bold">"{search}"</span>
								</p>
							) : (
								<p>Results will appear here...</p>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default AttachUsersToVouchers;
