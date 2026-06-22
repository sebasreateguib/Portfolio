'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { COPILOT_OPEN_EVENT } from '../../lib/copilot-events';

const MorphPanel = dynamic(() => import('./ai-input'), {
    ssr: false,
});

export default function LazyMorphPanel() {
    const [shouldLoad, setShouldLoad] = useState(false);
    const [openOnMount, setOpenOnMount] = useState(false);

    useEffect(() => {
        const load = () => setShouldLoad(true);

        const onOpen = (event: Event) => {
            load();
            if ((event as CustomEvent<{ immediate?: boolean }>).detail?.immediate) {
                setOpenOnMount(true);
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
                load();
            }
        };

        window.addEventListener(COPILOT_OPEN_EVENT, onOpen);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('pointerdown', load, { once: true });
        window.addEventListener('scroll', load, { once: true, passive: true });

        let idleId: number | undefined;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        if ('requestIdleCallback' in window) {
            idleId = window.requestIdleCallback(load, { timeout: 1500 });
        } else {
            timeoutId = setTimeout(load, 1200);
        }

        return () => {
            window.removeEventListener(COPILOT_OPEN_EVENT, onOpen);
            window.removeEventListener('keydown', onKeyDown);
            if (idleId !== undefined) window.cancelIdleCallback(idleId);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    if (!shouldLoad) return null;

    return <MorphPanel openOnMount={openOnMount} />;
}
