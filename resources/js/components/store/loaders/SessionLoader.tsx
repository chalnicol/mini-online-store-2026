import { Loader } from "lucide-react";
import BaseModal from "../BaseModal";

const SessionLoader: React.FC = () => {
	return (
		<BaseModal>
			<div className="w-full max-w-sm bg-white rounded px-4 py-3 flex flex-col items-center justify-center shadow-lg">
				<p className="font-bold text-gray-600 text-lg">
					{import.meta.env.VITE_APP_NAME}
				</p>
				<hr className="my-2 border-b w-full border-gray-200" />
				<div className="flex items-center gap-x-2">
					<Loader size={18} className="animate-spin" />
					<p className="font-semibold text-gray-600 text-center">
						Loading Session
					</p>
				</div>
			</div>
		</BaseModal>
	);
};

export default SessionLoader;
