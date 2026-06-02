'use client'

import { useEffect, useRef } from 'react'
import { useInViewport } from '../../hooks/use-in-viewport'
import { cn } from '../../lib/utils'

interface ViewportVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    src?: string
    wrapperClassName?: string
}

export function ViewportVideo({
    src,
    className,
    wrapperClassName,
    children,
    ...props
}: ViewportVideoProps) {
    const { ref, isInViewport } = useInViewport<HTMLDivElement>(0.25, '50px')
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (isInViewport) {
            video.play().catch(() => {})
        } else {
            video.pause()
        }
    }, [isInViewport])

    return (
        <div ref={ref} className={cn('relative w-full h-full', wrapperClassName)}>
            <video
                ref={videoRef}
                src={src}
                muted
                loop
                playsInline
                preload="none"
                className={className}
                {...props}
            >
                {children}
            </video>
        </div>
    )
}
