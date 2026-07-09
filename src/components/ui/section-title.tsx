import { cn } from '@/lib/utils';

interface SectionTitleProps {
    children: React.ReactNode;
    className?: string;
    as?: 'h1' | 'h2' | 'h3';
}

export function SectionTitle({ children, className, as: Tag = 'h2' }: SectionTitleProps) {
    return (
        <Tag
            className={cn(
                'font-section text-2xl md:text-3xl lg:text-4xl font-semibold text-white uppercase tracking-[0.08em]',
                className
            )}
        >
            {children}
        </Tag>
    );
}
