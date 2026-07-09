'use client'

import { useEffect, useRef } from 'react'
import { useInViewport } from '../../hooks/use-in-viewport'
import { cn } from '../../lib/utils'

interface ViewportVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    src?: string
    wrapperClassName?: string
    eager?: boolean
}

export function ViewportVideo({
    src,
    className,
    wrapperClassName,
    eager = false,
    children,
    ...props
}: ViewportVideoProps) {
    const { ref, isInViewport } = useInViewport<HTMLDivElement>(0.25, '50px')
    const videoRef = useRef<HTMLVideoElement>(null)
    const shouldPlay = eager || isInViewport

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (shouldPlay) {
            video.play().catch(() => {})
        } else {
            video.pause()
        }
    }, [shouldPlay])

    return (
        <div ref={ref} className={cn('relative w-full h-full', wrapperClassName)}>
            <video
                ref={videoRef}
                src={src}
                muted
                loop
                playsInline
                preload={eager ? 'auto' : 'none'}
                className={className}
                {...props}
            >
                {children}
            </video>
        </div>
    )
}
