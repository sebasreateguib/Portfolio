import { cn } from '@/lib/utils';

interface SectionDividerProps {
    label: string;
    className?: string;
    index?: string; // e.g. "01", "02"
}

/**
 * Diagonal / angled section divider.
 * The label sits in a parallelogram-shaped tab (clip-path angled right edge),
 * followed by a thin line that fades out to the right.
 * Optionally prefixes the label with an index number.
 */
export function SectionDivider({ label, className, index }: SectionDividerProps) {
    return (
        <div className={cn('flex items-center gap-0 mb-6 md:mb-16', className)}>
            {/* Angled label badge */}
            <div
                className="relative shrink-0 bg-white/[0.06] border border-white/10 px-3 pr-5 py-1 md:px-5 md:pr-8 md:py-1.5"
                style={{
                    clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 100%, 0 100%)',
                }}
            >
                <span className="font-mono text-[8px] md:text-[10px] tracking-widest uppercase select-none flex items-center gap-1.5 md:gap-2">
                    {index && (
                        <>
                            <span className="text-blue-400/80 font-bold">{index}</span>
                            <span className="text-white/20">·</span>
                        </>
                    )}
                    <span className="text-white/50">{label}</span>
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
