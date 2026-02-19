import { cn } from '@/lib/utils';

interface AdminDetailCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

const AdminDetailCard = ({
    title,
    className,
    children,
}: AdminDetailCardProps) => {
    return (
        <div className={cn('flex flex-col space-y-1', className)}>
            <p className="text-[10px] font-semibold tracking-widest uppercase">
                {title}
            </p>
            {children}
        </div>
    );
};

export default AdminDetailCard;
