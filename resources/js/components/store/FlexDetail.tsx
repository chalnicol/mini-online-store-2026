interface DetailProps {
    label: string;
    children: React.ReactNode;
}

const FlexDetail = ({ label, children }: DetailProps) => {
    return (
        <div className="flex flex-wrap gap-2">
            <div className="min-w-28 px-2 text-sm font-semibold">{label}</div>
            <div>{children}</div>
        </div>
    );
};

export default FlexDetail;
