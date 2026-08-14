'use client'

import { useEffect, useRef, useState } from 'react'
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
    eager,
    children,
    ...props
}: ViewportVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    // A playing video holds a hardware decoder open, so the source is only
    // attached once it has come near the viewport, and never detached after —
    // re-downloading on every scroll pass would be worse than keeping it.
    const [shouldLoad, setShouldLoad] = useState(!!eager)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { rootMargin: '200px 0px' },
        )
        observer.observe(video)

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (isVisible) setShouldLoad(true)
    }, [isVisible])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        video.defaultMuted = true
        video.muted = true

        if (isVisible && shouldLoad) {
            const promise = video.play()
            if (promise !== undefined) {
                promise.catch(() => {
                    // Ignore autoplay restrictions if any
                })
            }
        } else {
            video.pause()
        }
    }, [isVisible, shouldLoad, src])

    return (
        <div className={cn('relative w-full h-full', wrapperClassName)}>
            <video
                ref={videoRef}
                src={shouldLoad ? src : undefined}
                muted
                loop
                playsInline
                preload={eager ? 'auto' : 'metadata'}
                className={className}
                {...props}
            >
                {children}
            </video>
        </div>
    )
}
