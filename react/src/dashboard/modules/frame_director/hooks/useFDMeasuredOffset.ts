import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { FDItem, FDItemResolvedOffset } from '../types';
import useFDPositionReady, { isFDItemResolvedOffset } from './useFDPositionReady';
import useFrameDirector from './useFrameDirector';

export default function useFDMeasuredOffset(item: FDItem, resolveOffset: (elRect: DOMRect) => FDItemResolvedOffset) {
    const ref = useRef<HTMLDivElement>(null);
    const { updateElement } = useFrameDirector();
    const [elRect, setElRect] = useState<DOMRect>(null);

    const offset = useMemo(() => {
        if (!elRect) {
            return null;
        }

        return resolveOffset(elRect);
    }, [elRect, resolveOffset]);

    const isPositionReady = useFDPositionReady(item, offset);

    useLayoutEffect(() => {
        const updateRect = () => {
            setElRect(ref.current?.getBoundingClientRect() ?? null);
        };

        updateRect();

        if (!ref.current) {
            return;
        }

        const observer = new ResizeObserver(updateRect);
        observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    useLayoutEffect(() => {
        if (!elRect || !item?.key || !isFDItemResolvedOffset(offset)) {
            return;
        }

        updateElement(item.key, { offset });
    }, [elRect, item.key, offset, updateElement]);

    return useMemo(() => {
        return { ref, itemWidth: elRect?.width, itemHeight: elRect?.height, activePosition: offset, isPositionReady };
    }, [offset, elRect?.height, elRect?.width, isPositionReady]);
}
