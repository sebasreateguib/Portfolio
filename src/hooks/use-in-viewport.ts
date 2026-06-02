'use client'

import { useEffect, useRef, useState } from 'react'

export function useInViewport<T extends Element>(
    threshold = 0.1,
    rootMargin = '0px'
) {
    const ref = useRef<T>(null)
    const [isInViewport, setIsInViewport] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => setIsInViewport(entry.isIntersecting),
            { threshold, rootMargin }
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [threshold, rootMargin])

    return { ref, isInViewport }
}
