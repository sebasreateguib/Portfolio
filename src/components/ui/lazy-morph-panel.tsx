'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const MorphPanel = dynamic(() => import('./ai-input'), {
    ssr: false,
});

export default function LazyMorphPanel() {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        const load = () => setShouldLoad(true);

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
                load();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('pointerdown', load, { once: true });
        window.addEventListener('scroll', load, { once: true, passive: true });

        let idleId: number | undefined;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        if ('requestIdleCallback' in window) {
            idleId = window.requestIdleCallback(load, { timeout: 3500 });
        } else {
            timeoutId = setTimeout(load, 3000);
        }

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            if (idleId !== undefined) window.cancelIdleCallback(idleId);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    if (!shouldLoad) return null;

    return <MorphPanel />;
}
