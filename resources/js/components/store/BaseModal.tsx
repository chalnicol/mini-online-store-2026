interface BaseModalProps {
	children: React.ReactNode;
}
const BaseModal: React.FC<BaseModalProps> = ({ children }) => {
	return (
		<div className="fixed w-full h-full top-0 left-0 bg-gray-500/70 flex items-center justify-center p-4 overflow-hidden z-50">
			{children}
		</div>
	);
};
export default BaseModal;
