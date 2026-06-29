import { cn } from '@/lib/utils';

interface SectionDividerProps {
    label: string;
    className?: string;
}

/**
 * Option 2: Diagonal / angled section divider.
 * The label sits in a parallelogram-shaped tab (clip-path angled right edge),
 * followed by a thin line that fades out to the right.
 */
export function SectionDivider({ label, className }: SectionDividerProps) {
    return (
        <div className={cn('flex items-center gap-0 mb-6 md:mb-16', className)}>
            {/* Angled label badge */}
            <div
                className="relative shrink-0 bg-white/[0.06] border border-white/10 px-3 pr-5 py-1 md:px-5 md:pr-8 md:py-1.5"
                style={{
                    clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 100%, 0 100%)',
                }}
            >
                <span className="font-mono text-[8px] md:text-[10px] tracking-widest uppercase text-white/50 select-none">
                    {label}
                </span>
            </div>

            {/* Line that fades out */}
            <div
                className="flex-1 h-px"
                style={{
                    background: 'linear-gradient(to right, rgba(255,255,255,0.15) 0%, transparent 70%)',
                }}
            />
        </div>
    );
}
