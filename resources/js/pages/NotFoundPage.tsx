import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

const NotFoundPage = () => {
	const error = useRouteError();

	// Check if it's specifically a 404 (route not found)
	if (isRouteErrorResponse(error) && error.status === 404) {
		return (
			<div className="flex flex-col items-center justify-center min-h-44 space-y-4 py-6 px-4 bg-gray-100 rounded mt-4 max-w-2xl mx-auto shadow border border-gray-300">
				<h1 className="text-6xl font-bold text-sky-900">404</h1>
				<p className="text-xl text-gray-600">
					Oops! The page you're looking for doesn't exist.
				</p>
				<Link
					to="/"
					className="bg-sky-900 text-white px-6 py-2 rounded shadow font-bold hover:bg-sky-800 cursor-pointer"
				>
					Go Back Home
				</Link>
			</div>
		);
	}

	// Fallback for other types of errors (like a crash)
	return <div className="p-10 text-center">Something went wrong.</div>;
};

export default NotFoundPage;
