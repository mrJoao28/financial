'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Re-runs `fetcher` every `intervalMs` (only while the tab is visible) and
 * keeps the latest result. `initial` is the server-rendered snapshot.
 */
export default function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number, initial: T) {
    const [data, setData] = useState<T>(initial);
    const [updatedAt, setUpdatedAt] = useState<number | null>(null);
    const [failed, setFailed] = useState(false);
    const fetcherRef = useRef(fetcher);

    useEffect(() => {
        fetcherRef.current = fetcher;
    });

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (document.visibilityState === 'hidden') return;
            try {
                const next = await fetcherRef.current();
                if (cancelled) return;
                setData(next);
                setUpdatedAt(Date.now());
                setFailed(false);
            } catch {
                if (!cancelled) setFailed(true);
            }
        };

        const id = setInterval(run, intervalMs);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [intervalMs]);

    return { data, updatedAt, failed };
}
