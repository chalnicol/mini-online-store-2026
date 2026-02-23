import BaseModal from './BaseModal';

const CustomModal = ({
    children,
    onClose,
    size = 'md',
}: {
    size: 'sm' | 'md' | 'lg' | 'xl';
    onClose: () => void;
    children: React.ReactNode;
}) => {
    return (
        <BaseModal size="lg">
            <div>
                <div className="flex justify-end">
                    <button
                        className="cursor-pointer rounded-t bg-sky-900 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-white hover:bg-sky-800"
                        onClick={onClose}
                    >
                        CLOSE
                    </button>
                </div>
                <div className="rounded rounded-tr-none bg-white p-3 shadow-lg">
                    {children}
                </div>
            </div>
        </BaseModal>
    );
};

export default CustomModal;
