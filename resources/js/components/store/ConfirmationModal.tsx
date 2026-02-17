import BaseModal from './BaseModal';
import CustomButton from './CustomButton';

interface ConfirmationModalProps {
    message?: string;
    details?: string;
    isLoading?: boolean;
    isProcessing?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    message,
    details,
    isLoading,
    isProcessing,
    onClose,
    onConfirm,
}) => {
    const finalMessage =
        message || 'Are you sure you want to perform this action?';

    return (
        <BaseModal size="lg">
            <div className="space-y-2 rounded border border-gray-400 bg-white px-4 py-3 shadow-lg">
                <p className="font-bold text-gray-500">{finalMessage}</p>
                {details && details !== '' && (
                    <p className="rounded border border-gray-400 bg-gray-100 p-2 text-sm font-semibold text-gray-500">
                        {details}
                    </p>
                )}
                <div className="mt-4 flex items-center space-x-2">
                    <CustomButton
                        type="button"
                        label="Cancel"
                        color="secondary"
                        disabled={isLoading || isProcessing}
                        onClick={onClose}
                    />
                    <CustomButton
                        type="button"
                        label="Confirm"
                        color="danger"
                        loading={isProcessing}
                        disabled={isLoading || isProcessing}
                        onClick={onConfirm}
                    />
                </div>
            </div>
        </BaseModal>
    );
};
export default ConfirmationModal;
