'use client'

import { useEffect, useRef } from 'react'
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

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        video.defaultMuted = true
        video.muted = true

        const playVideo = () => {
            const promise = video.play()
            if (promise !== undefined) {
                promise.catch(() => {
                    // Ignore autoplay restrictions if any
                })
            }
        }

        playVideo()
    }, [src])

    return (
        <div className={cn('relative w-full h-full', wrapperClassName)}>
            <video
                ref={videoRef}
                src={src}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className={className}
                {...props}
            >
                {children}
            </video>
        </div>
    )
}
